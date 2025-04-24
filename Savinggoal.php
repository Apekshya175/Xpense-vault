<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = (int) $_SESSION['user_id'];
$action  = $_GET['action'] ?? '';

switch ($action) {

  case 'add':
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['goal_name']) || empty($data['target_amount']) || empty($data['deadline'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        exit;
    }
    $g = $conn->real_escape_string($data['goal_name']);
    $t = (float) $data['target_amount'];
    $d = $conn->real_escape_string($data['deadline']);

    $sql = "INSERT INTO saving_goals
              (user_id, goal_name, target_amount, deadline)
            VALUES
              ($user_id, '$g', $t, '$d')";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    exit;


  case 'get':
    // We don't have goal_id in transactions, so 'saved' is always 0 for now
    $sql = "SELECT
              id,
              goal_name,
              target_amount,
              deadline,
              0 AS saved
            FROM saving_goals
            WHERE user_id = $user_id
            ORDER BY deadline ASC";
    $res = $conn->query($sql);
    $goals = [];
    while ($row = $res->fetch_assoc()) {
        $goals[] = $row;
    }
    echo json_encode(['success' => true, 'goals' => $goals]);
    exit;


//   case 'get_saving_total':
//     // Sum up all transactions for this user
//     $sql = "SELECT IFNULL(SUM(amount),0) AS total_saving
//             FROM transactions
//             WHERE auth_id = $user_id";
//     $res = $conn->query($sql);
//     $r   = $res->fetch_assoc();
//     echo json_encode(['success' => true, 'total_saving' => $r['total_saving']]);
//     exit;

case 'get_saving_total':
    
    $sql1 = "
      SELECT IFNULL(SUM(amount),0) AS trans_total
      FROM transactions
      WHERE auth_id = $user_id
    ";
    $res1 = $conn->query($sql1);
    $trans_total = $res1->fetch_assoc()['trans_total'];

    $sql2 = "
      SELECT IFNULL(SUM(target_amount),0) AS goals_total
      FROM saving_goals
      WHERE user_id = $user_id
    ";
    $res2 = $conn->query($sql2);
    $goals_total = $res2->fetch_assoc()['goals_total'];


    $available = $trans_total - $goals_total;

    echo json_encode([
      'success'      => true,
      'total_saving' => $available
    ]);
    exit;


  case 'delete':
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid input']);
        exit;
    }
    $id = (int) $data['id'];
    $sql = "DELETE FROM saving_goals
            WHERE id = $id
              AND user_id = $user_id";
    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => $conn->error]);
    }
    exit;


  default:
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

$conn->close();
