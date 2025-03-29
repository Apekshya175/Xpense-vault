<?php
header("Content-Type: application/json");
include 'db.php';

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

    $stmt = $conn->prepare("INSERT INTO transactions (type, expenseType, amount, date) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssis", $type, $expenseType, $amount, $date);
    $stmt->execute();
    $stmt->close();
    
    echo json_encode(["message" => "Transaction added successfully"]);
} elseif ($method == 'GET') {
    $result = $conn->query("SELECT * FROM transactions ORDER BY date DESC");
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

    $stmt = $conn->prepare("DELETE FROM transactions WHERE id = ?");
    $stmt->bind_param("i", $data['id']);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["message" => "Transaction deleted successfully"]);
}

$conn->close();
?>
