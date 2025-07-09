    <?php

    header("Access-Control-Allow-Origin: *"); // Change '*' to specific origin if needed
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Content-Type: application/json");

    require_once '../../config/database.php';

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
        $contact = $data['from'];

        $current_user = $_SESSION['user_id'];

        if (!isset($contact, $chatroom_id) ||trim($contact) === '' ||trim($chatroom_id) === '') {
            //http_response_code(400);
            throw new Exception('There are missing data needed for sending messages');
        }

        $sql = "SELECT * FROM messages WHERE chatroom_id = ? ORDER BY timestamp ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $chatroom_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = [];
        
        while($row = $result->fetch_assoc()){
            $messages[] = $row;
        }

        $response['status'] = true;
        $response['message'] = 'Messages fetches successfully';
        $response['data'] = $messages;        

        echo json_encode($response);         
        
    }catch(Exception $e){
        http_response_code(500);
        $response['message'] = $e->getMessage();
        echo json_encode($response);
    }