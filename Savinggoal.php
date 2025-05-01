<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';

if (!isset($_SESSION['user_id'])) { echo json_encode(['success'=>false,'message'=>'Unauthorized']); exit; }
$user_id = (int)$_SESSION['user_id'];
$action = $_GET['action']??'';

switch($action){
  case 'add':
    $data=json_decode(file_get_contents('php://input'),true);
    if(empty($data['goal_name'])||empty($data['target_amount'])||empty($data['deadline'])){
      echo json_encode(['success'=>false,'message'=>'Invalid input']); exit;
    }
    $g=$conn->real_escape_string($data['goal_name']);
    $t=(float)$data['target_amount'];
    $d=$conn->real_escape_string($data['deadline']);
    $sql="INSERT INTO saving_goals (user_id,goal_name,target_amount,deadline) VALUES ($user_id,'$g',$t,'$d')";
    echo $conn->query($sql)?json_encode(['success'=>true]):json_encode(['success'=>false,'message'=>$conn->error]);
    exit;

  case 'get':
    $sql="SELECT id,goal_name,target_amount,deadline,
             IF(CURDATE()>=deadline,target_amount,0) AS saved
           FROM saving_goals
           WHERE user_id=$user_id
           ORDER BY deadline ASC";
    $res=$conn->query($sql);
    $goals=[]; while($row=$res->fetch_assoc()) $goals[]=$row;
    echo json_encode(['success'=>true,'goals'=>$goals]); exit;

  case 'get_saving_total':
    $sql="SELECT IFNULL(SUM(IF(CURDATE()>=deadline,target_amount,0)),0) AS total_saving
          FROM saving_goals WHERE user_id=$user_id";
    $r=$conn->query($sql)->fetch_assoc();
    echo json_encode(['success'=>true,'total_saving'=>$r['total_saving']]); exit;

  case 'delete':
    $data=json_decode(file_get_contents('php://input'),true);
    if(!isset($data['id'])){ echo json_encode(['success'=>false,'message'=>'Invalid input']); exit; }
    $id=(int)$data['id'];
    $sql="DELETE FROM saving_goals WHERE id=$id AND user_id=$user_id";
    echo $conn->query($sql)?json_encode(['success'=>true]):json_encode(['success'=>false,'message'=>$conn->error]);
    exit;

  default:
    echo json_encode(['success'=>false,'message'=>'Invalid action']); exit;
}
$conn->close();