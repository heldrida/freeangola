<?php

	if (stripos($_SERVER["HTTP_HOST"], "dev.freeangola")) {

		header("Access-Control-Allow-Origin: http://dev.freeangola.com");

	} else if (stripos($_SERVER["HTTP_HOST"], "freeangola")) {

		header("Access-Control-Allow-Origin: http://freeangola.com");

	} else {

		header("Access-Control-Allow-Origin: *");

	}

	require("credentials.php");
	require("Services/Soundcloud.php");

	$client = new Services_Soundcloud($sc_client_id, $sc_secret);

	$oauth_token = $client->credentialsFlow($sc_user, $sc_pass);

	echo json_encode($oauth_token);