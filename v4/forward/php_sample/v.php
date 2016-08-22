<?php	
	include "dbcon.php";			
	
	$method = "AES-256-CBC";
	$cryptKey = "My32charPasswordAndInitVectorStr"; 
			
	$url = $_GET[url];
	if ($url == null || strcmp($url,"") == 0) {
		header('Location: /');	
		exit(0);
	}

	$finalUrl = urldecode($url);
	$finalUrl = str_replace("http://bridgezones.com", "", $finalUrl);
	$finalUrl = str_replace("http://www.bridgezones.com", "", $finalUrl);


	$data = array(
		'targeturl' => $finalUrl, 
		'val01'=> decryptIt($_GET[v01], $cryptKey),
		'val02'=> decryptIt($_GET[v02], $cryptKey),
		'val03'=> decryptIt($_GET[v03], $cryptKey),
		'val04'=> decryptIt($_GET[v04], $cryptKey),
		'val05'=> decryptIt($_GET[v05], $cryptKey),
		'val06'=> decryptIt($_GET[v06], $cryptKey),
		'val07'=> decryptIt($_GET[v07], $cryptKey),
		'val08'=> decryptIt($_GET[v08], $cryptKey),
		'val09'=> decryptIt($_GET[v09], $cryptKey),
		'val10'=> decryptIt($_GET[v10], $cryptKey),
		'val11'=> decryptIt($_GET[v11], $cryptKey),
		'val12'=> decryptIt($_GET[v12], $cryptKey),
		'val13'=> decryptIt($_GET[v13], $cryptKey),
		'val14'=> decryptIt($_GET[v14], $cryptKey),
		'val15'=> decryptIt($_GET[v15], $cryptKey),
		'val16'=> decryptIt($_GET[v16], $cryptKey),
		);

	insertdatas($data, $dbcon);

	header('Location: ' . $finalUrl);	
	
   	/**************************************************************************/
	function render($content) {
	        header('Content-Type: application/json; charset=utf8');
	        header("Access-Control-Allow-Origin: *");
	       
	        echo json_encode($content);
	}

	function insertdatas($insData, $p_dbcon){
	    $columns = implode(", ",array_keys($insData));
	    $escaped_values = array_map('mysql_real_escape_string', array_values($insData));
	    foreach ($escaped_values as $idx=>$data) $escaped_values[$idx] = "'".$data."'";
	    $values  = implode(", ", $escaped_values);
	    $query = "INSERT INTO `bluehack_bluelens_user` ($columns) VALUES ($values)";
	    mysql_query($query, $p_dbcon) or die(mysql_error());
	    mysql_close($p_dbcon);
	}

	function decryptIt( $q , $cryptKey) {    	
		global $method;
		if ($q == null || $cryptKey == null) return "";
		
    	$data = urldecode($q);    	
    	
    	$decrypted = decryptWithTSValidation($data, $method, $cryptKey, 0, 60*60*12);
    	return $decrypted;
	}
			
	function decrypt ($encrypted, $method, $secret, $hmac) {
	    //if (hash_hmac('md5', $encrypted, $secret) == $hmac) {
	        $iv = base64_decode(substr($encrypted, 0, 24));
	        return openssl_decrypt(substr($encrypted, 24), $method, $secret, 0, $iv);
	    //}
	}
	
	function decryptWithTSValidation ($encrypted, $method, $secret, $hmac, $intervalThreshold) {
	    $decrypted = decrypt($encrypted, $method, $secret, $hmac);
	    $now = new DateTime();
	    $msgDate = new DateTime(str_replace("T"," ",substr($decrypted,0,19)));
	    if (($now->getTimestamp() - $msgDate->getTimestamp()) <= $intervalThreshold) {
	        return substr($decrypted,19);
	    }
	}
		 
?>
