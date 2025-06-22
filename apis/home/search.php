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

    $sql  = "SELECT u.*, c.status AS contact_status
                FROM users u
                LEFT JOIN contact_rels c
                    ON ((c.user_id = ? AND c.contact_id = u.id) OR (c.user_id = u.id AND c.contact_id = ?))
                WHERE (u.username LIKE ? OR u.email LIKE ?)
                AND u.id != ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iissi', $user_id,$user_id, $searchPattern, $searchPattern, $user_id);

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


    /* 

        TODO:
            1. after getting results, look at contact list
            2. check if the user is in there, if not, search results must have 'add friend' button
            3. if in there, check status, based on that, search result will have 'pending' or 'friend' status
            

            SELECT u.*, c.status AS contact_status
            FROM users u
            LEFT JOIN contact_rels c
                ON ((c.user_id = ? AND c.contact_id = u.id) OR (c.user_id = u.id AND c.contact_id = ?))
            WHERE (u.username LIKE ? OR u.email LIKE ?)
            AND u.id != ?


    
    */