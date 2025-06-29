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

    $currentUserId   = $_SESSION['user_id'];
    $user_to_message = $_SESSION['to_message'];

    // Fetch user info
    $sql = "SELECT id, username, email FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_to_message);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();

    if (!$user) {
        throw new Exception('Target user not found.');
    }

    // Find shared chatroom from contact_rels table
    $sqlChatroom = "
        SELECT id AS chatroom_id 
        FROM contact_rels 
        WHERE 
            (user_id = ? AND contact_id = ?) OR 
            (user_id = ? AND contact_id = ?)
        LIMIT 1
    ";
    $stmtChat = $conn->prepare($sqlChatroom);
    $stmtChat->bind_param('iiii', $currentUserId, $user_to_message, $user_to_message, $currentUserId);
    $stmtChat->execute();
    $chatRes = $stmtChat->get_result();
    $chat = $chatRes->fetch_assoc();

    if (!$chat) {
        throw new Exception('Chatroom not found.');
    }

    $user['chatroom_id'] = $chat['chatroom_id'];

    $response['status'] = true;
    $response['message'] = 'Target user and chatroom found.';
    $response['data'] = $user;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    $response['data'] = null;
}

echo json_encode($response);
