<?php 
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php'; //session start is here

$response = [   
    'status' => false,
    'message' => '',
    'data' => null,
];

try {

    if (!isset($_SESSION['user_id'])) {
        throw new Exception('User not authenticated.');
    }

    if (!isset($_SESSION['to_message'])) {
        throw new Exception('There is no target user set.');
    }

    $current_user = $_SESSION['user_id'];
    $user_to_message = $_SESSION['to_message'];

    // Fetch the target user info
    $sql = "SELECT id, username, email FROM users WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_to_message);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();

    if (!$user) {
        throw new Exception('Target user not found.');
    }

    // Fetch chatroom id from contact_rels table
    $chatroom_sql = "SELECT id FROM contact_rels 
                    WHERE (user_id = ? AND contact_id = ?) 
                    OR (user_id = ? AND contact_id = ?) 
                    LIMIT 1";
    $chatroom_stmt = $conn->prepare($chatroom_sql);
    $chatroom_stmt->bind_param('iiii', $current_user, $user_to_message, $user_to_message, $current_user);
    $chatroom_stmt->execute();
    $chatroom_res = $chatroom_stmt->get_result();
    $chatroom = $chatroom_res->fetch_assoc();

    $lastint_sql  = "UPDATE users SET users.last_int_wth = ? WHERE users.id = ?";
    $lastint_stmt = $conn->prepare($lastint_sql);
    $lastint_stmt->bind_param('ii', $user_to_message, $current_user);

    if (!$lastint_stmt->execute()) {
        throw new Exception('Failed to update last interaction.');
    }

    $updated_rows = $lastint_stmt->affected_rows;

    if ($updated_rows === 0) {
        $response['note'] = 'No change: last_int_wth was already set to this user.';
    }

    if ($chatroom) {
        $user['chatroom_id'] = $chatroom['id'];
    } else {
        $user['chatroom_id'] = null;
    }

    $response['status'] = true;
    $response['message'] = 'Target user found.';
    $response['data'] = $user;
    $response['current_user_id'] = $current_user;
    $response['last_int'] = "{$user_to_message} successfully set as last int with current user {$current_user}";

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    $response['data'] = null;
}

echo json_encode($response);
