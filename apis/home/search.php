<?php 
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods: GET');

    require_once '../../config/database.php';

    $response = [   
        'status' => false,
        'message' => '',
        'data' => []
    ];

    if(!$conn){
        http_response_code(500);
        $response['status'] = false;
        $response['message'] = 'Database connection failed.';
        echo json_encode($response);
        exit;
    }

    $searchFor = '';
    $user_id = '';

    if(isset($_GET['q'])){
        $searchFor = $_GET['q'];
        $user_id = $_GET['id'];
    }

    $searchPattern = "$searchFor%";

    $sql  = "SELECT * FROM users WHERE (username LIKE ? OR email LIKE ?) AND id != ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $searchPattern, $searchPattern, $user_id);

    $stmt->execute();
    $res = $stmt->get_result();

    if($res && $res->num_rows > 0){
        $response['status'] = true;
        $response['message'] = 'user/s found';
        while($row = $res->fetch_assoc()){
            $response['data'][] = $row;
        }

        echo json_encode($response);
    } else {
        $response['message'] = 'user/s not found';
        echo json_encode($response);
    }
