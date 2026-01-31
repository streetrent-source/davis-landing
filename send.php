<?php
// send.php — прокси для Bitrix24 (обходит CORS)
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$message = trim($data['message'] ?? '');

if ($phone === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Phone is required']);
  exit;
}

$webhookBase = 'https://davis.bitrix24.ru/rest/1/eeyx620umkdxsnxk/';
$endpoint = $webhookBase . 'crm.lead.add.json';

$payload = [
  'fields' => [
    'TITLE' => 'Заявка с сайта DAVIS',
    'NAME' => $name,
    'PHONE' => [
      ['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']
    ],
    'COMMENTS' => $message,
    'SOURCE_ID' => 'WEB',
  ]
];

$ch = curl_init($endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
$response = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($response === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => $err ?: 'Curl error']);
  exit;
}

echo $response;

