<?php
session_start();

// Clear all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

// Return JSON response
header('Content-Type: application/json');
echo json_encode(['status' => 'success']);
exit();
?>
