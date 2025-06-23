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
        $response['message'] = 'Database connection failed.';
        echo json_encode($response);
        exit;
    }

    try{

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $raw_data = file_get_contents('php://input');
            $data = json_decode($raw_data, true);

            $username = trim($data['username']);
            $email = trim($data['email']);
            $password = $data['password'];

            $sql = "INSERT INTO users (username, email, password) VALUES (?,?,?)";

            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, 'sss', $username, $email, $hashed_password);
            $result = mysqli_stmt_execute($stmt);

            $row = mysqli_affected_rows($conn);
            
            if($result){
                if($row>0){
                    http_response_code(201);
                    $response['status'] = true;
                    $response['message'] = 'Registration is successful.';
                    $response['data'] = null;
                }else{
                    http_response_code(500);
                    $response['status'] = false;
                    $response['message'] = 'Registration faield. Please try again.';
                    $response['data'] = null;
                }
            } else {
                    if (mysqli_errno($conn) == 1062) { 
                        http_response_code(409);
                        $response['status'] = 'error';
                        $response['message'] = 'Username or Email already exists.';
                        $response['data'] = null;
                } else {
                    http_response_code(500);
                        $response['status'] = 'error';
                        $response['message'] = 'Registration failed due to server error.';
                        $response['data'] = null;
                }
            }

            mysqli_stmt_close($stmt);
            mysqli_close($conn);

            echo json_encode($response);
        }

    } catch (Exception $e) {
        http_response_code(500);
        $response['status'] = 'error';
        $response['message'] = 'An error occurred: ' . $e->getMessage();
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }