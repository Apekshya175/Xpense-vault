<?php
include "db_setup.php"; // Ensures DB & table exist

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT); // Hash password

    // Check if connection is successful
    if ($conn->connect_error) {
        echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
        exit();
    }

    // Insert user into auth table (with name, email, and password)
    $stmt = $conn->prepare("INSERT INTO auth (name, email, password) VALUES (?, ?, ?)");
    
    if (!$stmt) {
        echo json_encode(["status" => "error", "message" => "Prepare failed: " . $conn->error]);
        exit();
    }

    $stmt->bind_param("sss", $name, $email, $password);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Signup successful"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Execute failed: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
$conn->close();
?>
