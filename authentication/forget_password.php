<?php
include "db_setup.php";  // Ensures DB & table exist
include 'SENDMAIL.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];

    // Check if the email exists
    $stmt = $conn->prepare("SELECT email FROM auth WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Generate a unique token for password reset
        $token = bin2hex(random_bytes(16));
        $tokenExpiry = date("Y-m-d H:i:s", strtotime('+1 hour')); // Token expires in 1 hour
        $stmt->close();

        // Store the reset token and expiry in the database
        $stmt = $conn->prepare("UPDATE auth SET reset_token = ?, reset_token_expiry = ? WHERE email = ?");
        $stmt->bind_param("sss", $token, $tokenExpiry, $email);
        $stmt->execute();
        $stmt->close();

        // Create the reset link
        $resetLink = "http://localhost/ExTR/reset.html?token=" . $token;
        

        // Send the reset email using the sendEmail function
        $subject = "Password Reset Request";
        $body = "Click on the following link to reset your password: <a href='$resetLink'>$resetLink</a>";

        if (SendEmail($email, $subject, $body)) {
            echo json_encode(["status" => "success", "message" => "Password reset link has been sent to your email."]);
        } else {
            echo json_encode(["status" => "error", "message" => "There was an error sending the email."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No user found with that email address."]);
    }
}

$conn->close();<?php
include "db_setup.php";  // Ensures DB & table exist
include 'SENDMAIL.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];

    // Check if the email exists
    $stmt = $conn->prepare("SELECT email FROM auth WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Generate a unique token for password reset
        $token = bin2hex(random_bytes(16));
        $tokenExpiry = date("Y-m-d H:i:s", strtotime('+1 hour')); // Token expires in 1 hour
        $stmt->close();

        // Store the reset token and expiry in the database
        $stmt = $conn->prepare("UPDATE auth SET reset_token = ?, reset_token_expiry = ? WHERE email = ?");
        $stmt->bind_param("sss", $token, $tokenExpiry, $email);
        $stmt->execute();
        $stmt->close();

        // Create the reset link
        $resetLink = "http://localhost/ExTR/reset.html?token=" . $token;
        

        // Send the reset email using the sendEmail function
        $subject = "Password Reset Request";
        $body = "Click on the following link to reset your password: <a href='$resetLink'>$resetLink</a>";

        if (SendEmail($email, $subject, $body)) {
            echo json_encode(["status" => "success", "message" => "Password reset link has been sent to your email."]);
        } else {
            echo json_encode(["status" => "error", "message" => "There was an error sending the email."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No user found with that email address."]);
    }
}

$conn->close();
?>