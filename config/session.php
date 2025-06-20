<?php 

    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST');

    require_once 'database.php';

    $response = [
        'status'  => false,
        'message' => '',
        'data'    => null
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = false;
        $response['message'] = 'Database connection failed.';
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }

    if($_SERVER['REQUEST_METHOD'] === 'POST'){
        if(empty($_SESSION['user_id']) || empty($_SESSION['user_email']) || empty($_SESSION['user'])){
            $response['message'] = 'You are not logged in';
            echo json_encode($response);
            exit;
        } else {
            $username = $_SESSION['user'];
            $response['status']  = true;
            $response['message'] = "Welcome {$username}";
            $response['data']    = [
                'id'       => $_SESSION['user_id'],
                'email'    => $_SESSION['user_email'],
                'username' => $_SESSION['user']
            ];
            echo json_encode($response);
        }
    }