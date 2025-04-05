<?php
session_start();
header("Content-Type: application/json");
include 'db.php';  // Ensure this file sets up the $conn connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action == 'add') {
    // Add a new saving goal
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['goal_name'], $data['target_amount'], $data['deadline'])) {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
        exit();
    }
    $goal_name = $conn->real_escape_string($data['goal_name']);
    $target_amount = floatval($data['target_amount']);
    $deadline = $conn->real_escape_string($data['deadline']);

    $sql = "INSERT INTO saving_goals (auth_id, goal_name, target_amount, deadline)
            VALUES ('$user_id', '$goal_name', '$target_amount', '$deadline')";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
    exit();
} elseif ($action == 'get') {
    // Retrieve saving goals for the current user
    $sql = "SELECT id, goal_name, target_amount, deadline FROM saving_goals WHERE auth_id = '$user_id' ORDER BY deadline ASC";
    $result = $conn->query($sql);
    $goals = [];
    while ($row = $result->fetch_assoc()) {
        $goals[] = $row;
    }
    echo json_encode(["success" => true, "goals" => $goals]);
    exit();
} elseif ($action == 'delete') {
    // Delete a saving goal
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['id'])) {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
        exit();
    }
    $goal_id = intval($data['id']);
    $sql = "DELETE FROM saving_goals WHERE id = '$goal_id' AND auth_id = '$user_id'";
    if ($conn->query($sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => $conn->error]);
    }
    exit();
} else {
    echo json_encode(["success" => false, "message" => "Invalid action"]);
}

$conn->close();
?>
