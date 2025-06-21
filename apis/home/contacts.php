<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: POST, GET, UPDATE, DELETE');

    require_once '../../config/database.php';

    $response = [   
        'status' => false,
        'message' => '',
        'data' => null
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = 'error';
        $response['message'] = 'Database connection failed.';
        $response['data'] = null;
        echo json_encode($response);
        exit;
    }

    switch($_SERVER['REQUEST_METHOD']){
        case 'POST':
            break;
    }

    function addContact($conn){
        
    }

    /* 
        in this api, i can

        C - create row when user adds another
        r - read contact-relation list
        u - update if the contact-relation status is accepted or pending
        d - if user reject request
    */