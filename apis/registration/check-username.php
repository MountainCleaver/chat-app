<?php 

    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST');

    require_once '../../config/database.php';

    $response = [
        'status' => '',
        'message' => '',
        'data' => ''
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = 'error';
        $response['message'] = 'Database connection failed.';
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
        $raw_data = file_get_contents('php://input');

        $data = json_decode($raw_data, true);

        $username = htmlspecialchars($data['username']);

        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = mysqli_prepare($conn, $sql);

        mysqli_stmt_bind_param($stmt, 's', $username);

        $result = mysqli_stmt_execute($stmt);

        mysqli_stmt_store_result($stmt);

        if(mysqli_stmt_num_rows($stmt) > 0){
            //http_response_code(409);
            $response['status'] = false;
            $response['message'] = 'Username is already used.';
            $response['data'] = null;
        } else {
            http_response_code(200);
            $response['status'] = true;
            $response['message'] = 'Username is available.';
            $response['data'] = null;
        }

        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        
        echo json_encode($response);
    } else {
        http_response_code(405);
        $response['status'] = false;
        $response['message'] = 'Method not allowed.';
        $response['data'] = null;
        echo json_encode($response);
    }