<?php 
require_once "config/database.php";

header('Content-Type: application/json');
//header('Access-Control-Allow-Methods: GET');

    try{
        if (!isset($_SESSION['user_id'])) {
            throw new Exception('User not authenticated.');
        }   
        $current_user_id = $_SESSION['user_id']; // Current logged-in user

        $sql = "SELECT 
                u.id,
                u.username,
                u.email
            FROM contact_rels cr
            JOIN users u 
            ON u.id = CASE 
                            WHEN cr.user_id = ? THEN cr.contact_id
                            ELSE cr.user_id 
                        END
            WHERE cr.status = 'accepted'
            AND (? IN (cr.user_id, cr.contact_id));";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $current_user_id, $current_user_id);
        if (!$stmt) {
            throw new Exception('SQL prepare failed: ' . $conn->error);
        }
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows > 0) {
            $response['status'] = true;
            $response['message'] = 'List of friends available';
            
            while ($friend = $result->fetch_assoc()) {
                $response['friends'][] = $friend;
            }

        } else {
            $response['status'] = true;
            $response['message'] = 'No friends found';
            $response['friends'] = [];
}
        echo json_encode($response);
    }catch(Exception $e){
        http_response_code(500);
        $response['message'] = 'Server error: ' . $e->getMessage();
        echo json_encode($response);
    }