<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         $q = intval($_GET['q']);
         $data = json_decode(file_get_contents('php://input'), true);

             $dbServerName = "db5001272959.hosting-data.io";
             $dbUsername = "dbu1070012";
             $dbPassword = "dhW$2021";
             $dbName = "dbs1087431";

             $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

         	if (!$conn) {
                   die("Connection failed: " . mysqli_connect_error());
             }

             echo "Connected successfully";

             $sql = "INSERT INTO images (exp_id, place_id, sequence, file_name) VALUES (" . $data["exp_id"] . "," . $data["place_id"] . "," . $data["seq"] . ",'" . $data["fileName"] . "')";
             if (mysqli_query($conn, $sql)) {
                   echo "New record created successfully";
             } else {
                   echo "Error: " . $sql . "<br>" . mysqli_error($conn);
             }
             mysqli_close($conn);
    }

