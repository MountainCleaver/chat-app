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

    $sql = "SELECT
                u.id,
                u.username, 
                u.email, 
                    c.status AS contact_status,             #status of relationship
                    c.user_id AS contact_user_id,           #id of -> sent friend request
                    c.contact_id AS contact_contact_id      #if of -> accepts friend request
                FROM users u
                LEFT JOIN contact_rels c
                    ON 
                        (
                            (c.user_id = ? AND c.contact_id = u.id) 
                        OR (c.user_id = u.id AND c.contact_id = ?)
                        )
                WHERE 
                    (u.username LIKE ? OR u.email LIKE ?) AND u.id != ?";


    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iissi', $user_id,$user_id, $searchPattern, $searchPattern, $user_id);

    $stmt->execute();
    $res = $stmt->get_result();

    if($res && $res->num_rows > 0){
        $response['status'] = true;
        $response['message'] = 'user/s found';
        while($row = $res->fetch_assoc()){

            if($row['contact_status'] === 'pending'){
                $row['request_sender'] = '';
                if((int)$user_id === (int)$row['contact_user_id']){
                    $row['request_sender'] = 'current_user';
                }else{
                    $row['request_sender'] = 'other_user';
                }
            }

            $response['data'][] = $row;
        }

        echo json_encode($response);
    } else {
        $response['message'] = 'user/s not found';
        echo json_encode($response);
    }