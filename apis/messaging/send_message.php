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
        'message' => ''
    ];

    try{
        $data = json_decode(file_get_contents("php://input"), true);

        $sender     = $data['sender'];
        $message    = $data['message'];
        $receiver   = $data['receiver'];
        $chatroomID = $data['chatroomID'];

        if (
            !isset($sender, $message, $receiver, $chatroomID) ||
            trim($sender) === '' ||
            trim($message) === '' ||
            trim($receiver) === '' ||
            trim($chatroomID) === ''
        ) {
            //http_response_code(400);
            throw new Exception('There are missing data needed for sending messages');
        }

        $decodedMessage = htmlspecialchars_decode($message, ENT_QUOTES);

        $sql = "INSERT INTO messages (chatroom_id, message, sender, receiver) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('isii', $chatroomID, $decodedMessage, $sender, $receiver);
        $stmt->execute();
        
        if($stmt->affected_rows > 0){
            $response['status'] = true;
            $response['message'] = 'Message sent successfully';

            $response['sender'] = $sender;
            $response['message'] = $message;
            $response['receiver'] = $receiver;
            $response['chatroomID'] = $chatroomID;
        } else {
            throw new Exception('Message not sent');
        }

        echo json_encode($response);         
        
    }catch(Exception $e){
        $response['message'] = $e->getMessage();
        echo json_encode($response); 
    }