<?php
    include "database.php";
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         $q = intval($_GET['q']);
         $data = json_decode(file_get_contents('php://input'), true);
         echo $data["exp_id"];

             $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

         	if (!$conn) {
                   die("Connection failed: " . mysqli_connect_error());
             }

             echo "Connected successfully";

             $sql = "INSERT INTO expeditions (exp_id, exp_name, startdate, enddate, leader) VALUES (" . $data["exp_id"] .",'" . $data["name"] . "','" . $data["startdate"] . "','" . $data["enddate"] . "','" . $data["leader"] . "')";
             if (mysqli_query($conn, $sql)) {
                   echo "New record created successfully";
             } else {
                   echo "Error: " . $sql . "<br>" . mysqli_error($conn);
             }
             mysqli_close($conn);
    }

