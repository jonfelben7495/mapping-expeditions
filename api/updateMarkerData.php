<?php
    include "database.php";
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         $q = intval($_GET['q']);
         $data = json_decode(file_get_contents('php://input'), true);

             $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

         	if (!$conn) {
                   die("Connection failed: " . mysqli_connect_error());
             }

             echo "Connected successfully";

             $sql = "UPDATE placesinexpeditions SET sequence = '" . $data["sequence"] . "', name = '" . $data["name"] . "', date = '" . $data["date"] . "', place_info = '" . $data["info"] . "', place_info_src = '" . $data["src"] . "', hasImages = " . $data["hasImages"] . " WHERE expeditionid = '" . $data["expId"] . "' AND placeid = '" . $data["placeId"] . "';";
             if (mysqli_query($conn, $sql)) {
                   echo "New record created successfully";
             } else {
                   echo "Error: " . $sql . "<br>" . mysqli_error($conn);
             }
             mysqli_close($conn);
    }

