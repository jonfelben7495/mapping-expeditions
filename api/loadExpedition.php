<?php
    include "database.php";
	$q = intval($_GET['q']);

    $conn = mysqli_connect($dbServerName, $dbUsername, $dbPassword, $dbName);

	$sql="SELECT * FROM expeditions as e JOIN placesinexpeditions as pe on e.exp_id = pe.expeditionid JOIN places as p on pe.placeid = p.placeid WHERE e.exp_id = '".$q."'";
    $result = mysqli_query($conn, $sql);
    $rows = array();
	while($r = mysqli_fetch_assoc($result)) {
	    $rows[] = $r;
	}
	print json_encode($rows);
