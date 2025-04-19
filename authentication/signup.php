<?php
session_start();
include "../db.php"; // Ensures DB & table exist

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT); // Hash password

    // Insert user into auth table (with name, email, and password)
    $stmt = $conn->prepare("INSERT INTO auth (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $password);

    if ($stmt->execute()) {
        $_SESSION['user_id']= $conn->insert_id;
        $_SESSION['username']= $name;
        echo json_encode(["status" => "success", "message" => "Signup successful"]);
    } else {
        echo json_encode(["status" => "error", "message" => "User already exists"]);
    }
    $stmt->close();
}
$conn->close();
?>
