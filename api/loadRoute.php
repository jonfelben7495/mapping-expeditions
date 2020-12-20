<?php
	$q = intval($_GET['q']);

    $dbServerName = "db5001272959.hosting-data.io";
    $dbUsername = "dbu1070012";
    $dbPassword = "dhW$2021";
    $dbName = "dbs1087431";

    $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

	$sql="SELECT * FROM expedition_routes WHERE exp_id = '".$q."'";
    $result = mysqli_query($conn, $sql);
    $rows = array();
	while($r = mysqli_fetch_assoc($result)) {
	    $rows[] = $r;
	}
	print json_encode($rows);
