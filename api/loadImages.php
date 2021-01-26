<?php
	$e = intval($_GET['e']);
	$p = intval($_GET['p']);

    $dbServerName = "db5001272959.hosting-data.io";
    $dbUsername = "dbu1070012";
    $dbPassword = "dhW$2021";
    $dbName = "dbs1087431";

    $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

	$sql="SELECT * FROM images as i WHERE i.exp_id = '".$e."' AND i.place_id = '".$p."'";
    $result = mysqli_query($conn, $sql);
    $rows = array();
	while($r = mysqli_fetch_assoc($result)) {
	    $rows[] = $r;
	}
	print json_encode($rows);
