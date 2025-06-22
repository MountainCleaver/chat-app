<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, GET, UPDATE, DELETE');

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
    }

    function addContact($conn) {

    global $response; // Use the $response array defined outside the function

    try {
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true); // Use true to decode as associative array

        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }

        if (!isset($data['user_id'])) {
            throw new Exception('No target user provided.');
        }

        $target_user_id = $data['user_id']; // User to be added as friend
        $current_user_id = $_SESSION['user_id']; // Current logged-in user

        // Insert friend request
        $sql = 'INSERT INTO contact_rels (user_id, contact_id) VALUES (?, ?)';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $current_user_id, $target_user_id);
        $execute = $stmt->execute();

        if (!$execute) {
            throw new Exception('Failed to send a friend request.');
        }

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

    } catch (Exception $e) {
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