<?php

    session_start();
    
    session_unset();
    session_destroy();

    // Optional: Force headers to prevent caching
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Thu, 01 Jan 1970 00:00:00 GMT');
    header('Content-Type: application/json');

    $response = [
        'status' => true,
        'message' => 'Logged out successfully.'
    ];

    echo json_encode($response);