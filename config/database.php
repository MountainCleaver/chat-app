<?php 

    session_start();

    $host = 'localhost';
    $user = 'root';
    $password = '';
    $database = 'chat_app';

    try{
        $conn = mysqli_connect($host, $user, $password, $database);
        if(!$conn){
            throw new Exception("Connection failed: " . mysqli_connect_error());
        }
    }catch(Exception $e){
        echo $e->getMessage();
        exit();
    }
    