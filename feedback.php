<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

require_once 'vendor/autoload.php';

$result     = ['result' => true];
$sendResult = false;

if (!empty($_POST['name'])) {
    $fullName = htmlspecialchars($_POST['name']);
} else {
    $result['result'] = false;
    $result['errors']['name'] = 'Необходимо ввести ФИО';
}

if (empty($_POST['e-mail'])) {
    $result['result'] = false;
    $result['errors']['e-mail'] = 'Необходимо ввести E-mail';
} elseif (!filter_var($_POST['e-mail'], FILTER_VALIDATE_EMAIL)) {
    $result['result'] = false;
    $result['errors']['e-mail']   = 'Введен некорректный адрес электронной почты';
} else {
    $from = htmlspecialchars($_POST['e-mail']);
}

if (empty($_POST['phone'])) {
    $result['result'] = false;
    $result['errors']['phone'] = 'Необходимо ввести Телефон';
} elseif (!preg_match('/\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/', $_POST['phone'])) {
    $result['result'] = false;
    $result['errors']['phone'] = 'Телефон введён некорректно';
} else {
    $phone = htmlspecialchars($_POST['phone']);
}

if (!empty($_POST['message'])) {
    $msg = htmlspecialchars($_POST['message']);
} else {
    $result['result'] = false;
    $result['errors']['message'] = 'Необходимо ввести Сообщение';
}

if ($result['result']) {
    $message = '';
    $message.= "<p><b>Имя</b>: {$fullName}</p>";
    $message.= "<p><b>E-mail</b>: {$from}</p>";
    $message.= "<p><b>Телефон</b>: {$phone}</p>";
    $msg = "<p><b>Сообщение</b>: {$msg}</p>";
    $message.= str_replace(PHP_EOL, '</p><p>', $msg);

    $message = (new Swift_Message('Новый запрос'))
        ->setFrom('mail@alpha-brakes.com', $fullName)
        ->setTo(['alphaeng.rus@gmail.com'])
        ->setReplyTo($from)
        ->setTo(['kit.aiti2.0.tests@gmail.com'])
        ->setBody($message, 'text/html')
    ;

//    $transport = (new Swift_SmtpTransport('aspmx.l.google.com', 25));

    //Уходят в спам
    $transport = (new Swift_SmtpTransport('mail.alpha-brakes.com', 25))
        ->setUsername('mail@alpha-brakes.com')
        ->setPassword('wnc892nckpsev29xc');

    $mailer = new Swift_Mailer($transport);

    $sendResult = $mailer->send($message);

    if (!$sendResult) {
        $result['result'] = false;
    }

    $result['send_result'] = $sendResult;

}

jsonResponse($result);

function jsonResponse($response) {
    header('Content-Type: application/json');
    header('Cache-Control: max-age=0');

    echo json_encode($response);
    exit;
}