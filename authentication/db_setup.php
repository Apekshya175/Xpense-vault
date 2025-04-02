<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "expense_tracker";

// Connect to MySQL
$conn = new mysqli($host, $user, $pass);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create Database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
$conn->query($sql);

// Select the database
$conn->select_db($dbname);

// Create auth table if not exists (add name column)
$sql = "CREATE TABLE IF NOT EXISTS auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,  -- Add this line for the reset_token
    reset_token_expiry DATETIME DEFAULT NULL -- Optional: To store when the token expires
)";
$conn->query($sql);

$conn->query($sql);
?>