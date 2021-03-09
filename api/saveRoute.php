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

             $a = $data["array"];
             echo $a;

            $i = 1;
             foreach ($a as $v) {
                    $sql = "INSERT INTO expedition_routes (exp_id, sequence, lat, lng) VALUES (" . $data["exp_id"] . "," . $i . "," . array_shift($v) . "," . array_shift($v) . ")";
                        if (mysqli_query($conn, $sql)) {
                        echo $sql . " was successful.";
                        } else {
                        echo "Error: " . $sql . "<br>" . mysqli_error($conn);
                        }
                    $i++;
             }


             mysqli_close($conn);
    }

