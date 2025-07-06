<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Method: POST');
    header('Access-Control-Allow-Headers: Content-Type');

    require_once '../../config/database.php'; //session is here

    $response = [   
        'status' => false,
        'message' => '',
        'to_message' => null,
        'chatroom_id' => null
    ];

    try {
        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);

        if (!isset($data['user_id'])) {
            throw new Exception('No target user provided.');
        }

        $target_user_id = (int)$data['user_id'];
        $current_user = $_SESSION['user_id'];

        $_SESSION['to_message'] = $target_user_id;

        $chatroom_sql = "SELECT id FROM contact_rels 
                    WHERE (user_id = ? AND contact_id = ?) 
                    OR (user_id = ? AND contact_id = ?) 
                    LIMIT 1";
        $chatroom_stmt = $conn->prepare($chatroom_sql);
        $chatroom_stmt->bind_param('iiii', $current_user, $target_user_id, $target_user_id, $current_user);
        $chatroom_stmt->execute();
        $chatroom_res = $chatroom_stmt->get_result();
        $chatroom = $chatroom_res->fetch_assoc();

        if ($chatroom) {
            $response['chatroom_id'] = $chatroom['id'];
        } else {
            $response['chatroom_id'] = null;
        }        

        $response['status'] = true;
        $response['message'] = 'Target user set successfully.';
        $response['to_message'] = $_SESSION['to_message'];

    } catch (Exception $e) {
        http_response_code(400);
        $response['message'] = $e->getMessage();
    }

echo json_encode($response);