<?php
/******************************************************************
 * of course I got too lazy because I made this api late, so I wrote 60 lines then let chatgpt finish it. the flow of deletion and queries, of course is my idea, so I can confidently say that this api is AI assistedly coded rather than vibe coeded
 *  unfriend.php – DELETE /unfriend
 *  Deletes the contact relation between $current_user and $unfriend
 *  as well as all messages in that chatroom.
 ******************************************************************/

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Content-Type: application/json');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../../config/database.php';

$response = [
    'status'  => false,
    'message' => '',
    'data'    => null
];

/* ---------- Pre‑flight (CORS) --------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* ---------- Method guard -------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);             // Method Not Allowed
    $response['message'] = 'Only DELETE is allowed on this endpoint.';
    echo json_encode($response);
    exit();
}

/* ---------- Basic sanity checks ------------------------------- */
if (!$conn) {
    http_response_code(500);
    $response['message'] = 'Database connection failed.';
    echo json_encode($response);
    exit();
}

try {
    /* -----------------------------------------------------------
       Parse and validate payload
    ----------------------------------------------------------- */
    $data         = json_decode(file_get_contents("php://input"), true);
    $unfriend     = $data['unfriend'] ?? null;
    $current_user = $_SESSION['user_id'] ?? null;

    if (!$current_user) {
        throw new Exception('Unauthenticated: no user in session.');
    }
    if (!$unfriend) {
        throw new Exception('No target user to unfriend.');
    }

    /* -----------------------------------------------------------
       Start a transaction so we can roll back on any failure
    ----------------------------------------------------------- */
    $conn->begin_transaction();

    /* -----------------------------------------------------------
       1. Get the chatroom (contact_rels.id) shared by the pair
    ----------------------------------------------------------- */
    $findSql = "
        SELECT id
        FROM contact_rels
        WHERE (user_id = ? AND contact_id = ?)
           OR (user_id = ? AND contact_id = ?)
        LIMIT 1
    ";
    $find = $conn->prepare($findSql);
    $find->bind_param('iiii', $current_user, $unfriend, $unfriend, $current_user);
    if (!$find->execute()) {
        throw new Exception('Failed to locate contact relation.');
    }
    $result = $find->get_result();
    if ($result->num_rows === 0) {
        throw new Exception('No friendship found between the specified users.');
    }
    $chatroom = $result->fetch_assoc()['id'];

    /* -----------------------------------------------------------
       2. Delete messages bound to that chatroom
          (Skip this step if you have ON DELETE CASCADE.)
    ----------------------------------------------------------- */
    $deleteMsgSql = "DELETE FROM messages WHERE chatroom_id = ?";
    $delMsg = $conn->prepare($deleteMsgSql);
    $delMsg->bind_param('i', $chatroom);
    if (!$delMsg->execute()) {
        throw new Exception('Failed to delete messages for the chatroom.');
    }

    /* -----------------------------------------------------------
       3. Delete the contact relationship itself
    ----------------------------------------------------------- */
    $delRelSql = "
        DELETE FROM contact_rels
        WHERE id = ?
    ";
    $delRel = $conn->prepare($delRelSql);
    $delRel->bind_param('i', $chatroom);
    if (!$delRel->execute() || $delRel->affected_rows === 0) {
        throw new Exception('Failed to delete contact relation.');
    }

    /* -----------------------------------------------------------
       4. Commit everything
    ----------------------------------------------------------- */
    $conn->commit();
    $response['status']  = true;
    $response['message'] = 'Unfriended successfully.';
    http_response_code(200);
} catch (Exception $e) {
    /* Any exception triggers a rollback */
    if ($conn->errno === 0 && $conn->in_transaction) {
        $conn->rollback();
    }
    http_response_code(400);
    $response['message'] = $e->getMessage();
} finally {
    echo json_encode($response);
    // close prepared statements and connection if desired
}
