<?php

	require("credentials.php");
	require("Services/Soundcloud.php");

	$client = new Services_Soundcloud($sc_client_id, $sc_secret);

	$oauth_token = $client->credentialsFlow($sc_user, $sc_pass);

	echo json_encode($oauth_token);