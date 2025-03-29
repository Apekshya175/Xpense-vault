<?php
session_start();
header("Content-Type: application/json");
include 'db.php';

if(!isset($_SESSION['user_id']))
{
    echo json_decode(["error"=> "unauthorized"]);
    exit;
}
$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['type'], $data['amount'], $data['date'])) {
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    $type = $data['type'];
    $expenseType = isset($data['expenseType']) ? $data['expenseType'] : '-';
    $amount = $data['amount'];
    $date = $data['date'];


        $stmt = $conn->prepare("INSERT INTO transactions (auth_id, type, expenseType, amount, date) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("issds", $userId, $type, $expenseType, $amount, $date);
    if($stmt->execute()){
        echo json_encode(["message" => "Transaction added successfully"]);
    } else {
        echo json_encode(["error" => "Failed to add transaction"]);
    }
    $stmt->close();
    
    
} elseif ($method == 'GET') {
    $stmt = $conn->prepare("SELECT * FROM transactions WHERE auth_id = ? ORDER BY date DESC");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result= $stmt->get_result();
    $transactions = [];

    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }

    echo json_encode($transactions);
} elseif ($method == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'])) {
        echo json_encode(["error" => "Invalid request"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ? AND auth_id= ?");
    $stmt->bind_param("ii", $data['id'], $userId);
    if($stmt->execute()){
        echo json_encode(["message" => "Transaction deleted successfully"]);
    } else {
        echo json_encode(["error" => "Failed to delete transaction"]);
    }
    $stmt->close();
}

$conn->close();
?>
