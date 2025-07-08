    <?php

    header("Access-Control-Allow-Origin: *"); // Change '*' to specific origin if needed
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");

    require_once '../../config/database.php'; //session is  here

    if(!$conn){
        http_response_code(500);
        $response['message'] = 'Database connection failed.';
        echo json_encode($response);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    $response = [
        'status' => false,
        'message' => '',
        'data' => null
    ];

    try{
        $data = json_decode(file_get_contents("php://input"), true);

        $chatroom_id = $data['chatroomID'];

        $current_user = $_SESSION['user_id'];

        if (
            !isset($chatroom_id) || trim($chatroom_id) === '') {
            //http_response_code(400);
            throw new Exception('There are missing data needed for sending messages');
        }

        $sql = "SELECT * FROM messages WHERE chatroom_id = ? ORDER BY timestamp DESC LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $chatroom_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $new_message = $result->fetch_assoc();

        $response['status'] = true;
        $response['message'] = 'New message fetched successfully';
        $response['new_message'] = $new_message;

        echo json_encode($response);         
        
    }catch(Exception $e){
        //http_response_code(500);
        $response['message'] = $e->getMessage();
        echo json_encode($response);
    }