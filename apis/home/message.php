<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

$response = [   
    'status' => false,
    'message' => '',
    'data' => null
];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not authenticated.');
    }

    if (!isset($_SESSION['to_message'])) {
        throw new Exception('There is no target user set.');
    }

    $user_to_message = $_SESSION['to_message'];

    $sql = "SELECT id, username, email FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_to_message);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();

    if (!$user) {
        throw new Exception('Target user not found.');
    }

    $response['status'] = true;
    $response['message'] = 'Target user found.';
    $response['data'] = $user;

} catch (Exception $e) {
    //http_response_code(400);
    $response['message'] = $e->getMessage();
    $response['data'] = null;
}

echo json_encode($response);
