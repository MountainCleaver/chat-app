<?php 

    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST');

    require_once '../../config/database.php';

    $response = [
        'status' => false,
        'message' => '',
        'data' => null
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = false;
        $response['message'] = 'Database connection failed.';
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }

    //$_SERVER['REQUEST_METHOD'] = 'POST';

    if($_SERVER['REQUEST_METHOD'] === 'POST'){

        $raw_data = file_get_contents('php://input');
        $data = json_decode($raw_data, true);

        //    $email = 'jorji@gmail.com';
        //   $password = 'jjjjjjjj';

        $email = isset($data['email']) ? trim($data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';

        if (empty($email) || empty($password)) {
            http_response_code(400);
            $response['message'] = 'Email and password are required.';
            echo json_encode($response);
            exit;
        }

        $sql = "SELECT * FROM users WHERE email = ? LIMIT 1";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if(!$user){
            $response['status'] = false;
            $response['message'] = 'Invalid email or password.';
            $response['data'] = null;

            echo json_encode($response);
            exit;
        }

        $password_match = password_verify($password, $user['password']);
        if($password_match){
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user'] = $user['username'];
            
            $response['status'] = true;
            $response['message'] = 'Login successful.';
            $response['data'] = null;

            echo json_encode($response);
            exit;
        } else {
            $response['status'] = false;
            $response['message'] = 'Invalid email or password.';
            $response['data'] = null;

            echo json_encode($response);
            exit;
        }

    }else {
        http_response_code(405); // Method Not Allowed
        $response['message'] = 'Invalid request method.';
        echo json_encode($response);
        exit;
    }