<?php
    include "database.php";
	$q = intval($_GET['q']);

    $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

	$sql="SELECT MAX(sequence) FROM expedition_routes WHERE exp_id = '".$q."'";
    $result = mysqli_query($conn, $sql);
    $rows = array();
	while($r = mysqli_fetch_assoc($result)) {
	    $rows[] = $r;
	}
	print json_encode($rows);
