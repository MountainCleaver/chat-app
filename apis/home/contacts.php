<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    require_once '../../config/database.php';//session_start is in here

    $response = [   
        'status' => false,
        'message' => '',
        'data' => null,
        'has_unread_message' => false
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = 'error';
        $response['message'] = 'Database connection failed.';
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }

    switch($_SERVER['REQUEST_METHOD']){
        case 'GET':
            getFriends($conn);
            break;
        case 'POST':
            addContact($conn);
            break;
        case 'DELETE':
            deleteRequest($conn);
            break;
        case 'PATCH':
            acceptRequest($conn);
            break;
    }

function addContact($conn) {

    global $response; // Use the $response array defined outside the function

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }

        if (!isset($data['user_id'])) {
            throw new Exception('No target user provided.');
        }

        $current_user_id = $_SESSION['user_id']; // Current logged-in user
        $target_user_id = $data['user_id']; // User to be added as friend

        // Insert friend request
        $sql = 'INSERT INTO contact_rels (user_id, contact_id) VALUES (?, ?)';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $current_user_id, $target_user_id);
        $execute = $stmt->execute();

        // Fetch the newly created relation to confirm
        $contactSql = 'SELECT status AS contact_status, contact_id FROM contact_rels WHERE user_id = ? AND contact_id = ?';
        $contactStmt = $conn->prepare($contactSql);
        $contactStmt->bind_param('ii', $current_user_id, $target_user_id);
        $contactStmt->execute();
        $result = $contactStmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $response['status'] = true;
            $response['message'] = 'Friend request sent.';
            $response['data'] = $row;
        } else {
            throw new Exception('Friend request not found after insertion.');
        }

        echo json_encode($response);

    } catch (mysqli_sql_exception $e) {
        if (strpos($e->getMessage(), 'Duplicate entry') !== false) {
            //http_response_code(409); // Conflict
            $response['status'] = false;
            $response['message'] = 'Friend request already exists.';
            echo json_encode($response);
            exit;
        } else {
            //http_response_code(500);
            $response['status'] = false;
            $response['message'] = 'Database error: ' . $e->getMessage();
            echo json_encode($response);
            exit;
        }
    } catch (Exception $e) {
        http_response_code(400);
        $response['status'] = false;
        $response['message'] = $e->getMessage();
        echo json_encode($response);
    }
}

function deleteRequest($conn){

    global $response;

    try{
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }

        if (!isset($data['user_id'])) {
            throw new Exception('No target user provided.');
        }

        $target_user_id = $data['user_id']; // friend request to be deleted
        $current_user_id = $_SESSION['user_id']; // Current logged-in user

        $sql = 'DELETE FROM contact_rels WHERE user_id = ? AND contact_id = ?';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $current_user_id, $target_user_id);
        $execute = $stmt->execute();

        if(!$execute){
            throw new Exception('Failed to cancel request');
        }

        $contactSql = 'SELECT * FROM contact_rels WHERE user_id = ? AND contact_id = ?';
        $contactStmt = $conn->prepare($contactSql);
        $contactStmt->bind_param('ii', $current_user_id, $target_user_id);
        $execute = $contactStmt->execute();
        $result = $contactStmt->get_result();

        if ($result && $result->num_rows === 0) {
            $row = $result->fetch_assoc();
            $response['status'] = true;
            $response['message'] = 'Friend request cancelled.';
            $response['data'] = $row;
        } else {
            throw new Exception('Friend request still exists after deletion.');
        }

        echo json_encode($response);

    }catch(Exception $e){
        http_response_code(400);
        $response['status'] = false;
        $response['message'] = $e->getMessage();
        echo json_encode($response);
    }
}

function acceptRequest($conn){
    
    global $response;

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try{
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data received.');
        }

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }

        if (!isset($data['user_id'])) {
            throw new Exception('No target user provided.');
        }

        $current_user_id = $_SESSION['user_id']; // Current logged-in user
        $target_user_id = $data['user_id']; // User to be added as friend

        $new_status = 'accepted';

        $sql = "UPDATE contact_rels SET status = ?, last_interaction = CURRENT_TIMESTAMP WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?);";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('siiii', $new_status, $current_user_id, $target_user_id, $target_user_id, $current_user_id);
        $execute = $stmt->execute();

        if ($stmt->affected_rows === 0) {
            throw new Exception('No friend request was updated. It may not exist.');
        }

        $contactSql = 'SELECT status AS contact_status, contact_id FROM contact_rels WHERE (user_id = ? AND contact_id = ?) OR (user_id = ? AND contact_id = ?)';
        $contactStmt = $conn->prepare($contactSql);
        $contactStmt->bind_param('iiii', $current_user_id, $target_user_id , $target_user_id, $current_user_id);
        $contactStmt->execute();
        $result = $contactStmt->get_result();

        if ($result && $result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $response['status'] = true;
            $response['message'] = 'Friend request Accepted.';
            $response['data'] = $row;
        } else {
            throw new Exception('Friend request not found after insertion.');
        }

        echo json_encode($response);
    }catch(Exception $e){
        $response['status'] = false;
        $response['message'] = $e->getMessage();
        echo json_encode($response);
    }
}

function getFriends($conn)
{
    global $response;

    try {
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }

        $current_user_id = $_SESSION['user_id']; // Current logged-in user

        $sql = "WITH latest_messages AS (
                    SELECT *
                    FROM (
                        SELECT 
                            m.*,
                            ROW_NUMBER() OVER (PARTITION BY m.chatroom_id ORDER BY m.timestamp DESC) AS rn
                        FROM messages m
                    ) ranked
                    WHERE rn = 1
                )

                SELECT 
                    u.id,
                    u.username,
                    u.email,
                    cr.last_interaction,
                    cr.id AS chatroom_id,
                    CASE 
                        WHEN lm.receiver = ? THEN lm.read_receipt
                        ELSE 'read'
                    END AS read_receipt
                FROM contact_rels cr
                JOIN users u 
                    ON u.id = CASE 
                                WHEN cr.user_id = ? THEN cr.contact_id
                                ELSE cr.user_id 
                            END
                LEFT JOIN latest_messages lm ON lm.chatroom_id = cr.id
                WHERE cr.status = 'accepted'
                AND (? IN (cr.user_id, cr.contact_id))
                ORDER BY cr.last_interaction DESC;";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception('SQL prepare failed: ' . $conn->error);
        }

        $stmt->bind_param('iii', $current_user_id, $current_user_id, $current_user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $response['friends'] = [];

        if ($result && $result->num_rows > 0) {
            $response['status'] = true;
            $response['message'] = 'List of friends available';

            $to_message_found = false;
            $replacement_candidate = null;

            while ($friend = $result->fetch_assoc()) {
                if (isset($_SESSION['to_message']) && $_SESSION['to_message'] == $friend['id']) {
                    $to_message_found = true;
                }

                if ($friend['read_receipt'] === 'read' && $replacement_candidate === null) {
                    $replacement_candidate = $friend['id'];
                }

                $response['friends'][] = $friend;
            }

            if ($to_message_found && isset($_SESSION['to_message'])) {
                foreach ($response['friends'] as $f) {
                    if ($f['id'] == $_SESSION['to_message'] && $f['read_receipt'] === 'unread') {
                        $_SESSION['to_message'] = $replacement_candidate ?? null;
                        break;
                    }
                }
            }

        } else {
            $response['status'] = true;
            $response['message'] = 'No friends found';
        }

        echo json_encode($response);
    } catch (Exception $e) {
        http_response_code(500);
        $response['message'] = 'Server error: ' . $e->getMessage();
        echo json_encode($response);
    }
}
