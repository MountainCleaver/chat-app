<?php
header('Content-Type: application/json');
require_once '../../config/database.php';

$response = [
    'status' => false,
    'message' => '',
    'data' => []
];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception("You are not logged in.");
    }

    if (!isset($_SESSION['to_message'])) {
        throw new Exception("No contact selected.");
    }

    $currentUser = $_SESSION['user_id'];
    $toUser = $_SESSION['to_message'];

    // Get chatroom_id
    $sql = "SELECT id FROM contact_rels 
            WHERE (user_id = ? AND contact_id = ?) 
               OR (user_id = ? AND contact_id = ?)
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $currentUser, $toUser, $toUser, $currentUser);
    $stmt->execute();
    $res = $stmt->get_result();
    $rel = $res->fetch_assoc();

    if (!$rel) throw new Exception("Chatroom not found.");
    $chatroom_id = $rel['id'];

    // Fetch messages
    $sql = "SELECT sender, message, timestamp FROM messages 
            WHERE chatroom_id = ?
            ORDER BY id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $chatroom_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    $response['status'] = true;
    $response['message'] = "Messages retrieved.";
    $response['data'] = $messages;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
