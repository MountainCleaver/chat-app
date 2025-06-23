<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }

    require_once '../../config/database.php';//session_start is in here

    $response = [   
        'status' => false,
        'message' => '',
        'data' => null
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
        case 'POST':
            addContact($conn);
            break;
        case 'DELETE':
            deleteRequest($conn);
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
            http_response_code(500);
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


    /* 
        in this api, i can

        C - create row when user adds another
        r - read contact-relation list
        u - update if the contact-relation status is accepted or pending
        d - if user reject request
    */