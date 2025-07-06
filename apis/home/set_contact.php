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

        $_SESSION['to_message'] = $target_user_id;

        $response['status'] = true;
        $response['message'] = 'Target user set successfully.';
        $response['to_message'] = $_SESSION['to_message'];

    } catch (Exception $e) {
        http_response_code(400);
        $response['message'] = $e->getMessage();
    }

echo json_encode($response);