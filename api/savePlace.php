<?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         $q = intval($_GET['q']);
         $data = json_decode(file_get_contents('php://input'), true);
         echo $data["exp_id"];

             $dbServerName = "db5001272959.hosting-data.io";
             $dbUsername = "dbu1070012";
             $dbPassword = "dhW$2021";
             $dbName = "dbs1087431";

             $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

         	if (!$conn) {
                   die("Connection failed: " . mysqli_connect_error());
             }

             echo "Connected successfully";

             $sql = "INSERT INTO places (placeid, place_name, latitude, longitude) VALUES (" . $data["placeid"] .",'" . $data["name"] . "'," . $data["lat"] . "," . $data["lng"] . ")";
             if (mysqli_query($conn, $sql)) {
                   echo "New record created successfully";
             } else {
                   echo "Error: " . $sql . "<br>" . mysqli_error($conn);
             }
             mysqli_close($conn);
    }

