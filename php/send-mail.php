<?php
/* send-mail.php - handles the contact form.
   Validates, saves to messages.txt, redirects back to the page. */


// only allow POST - if someone opens this in the browser, send them home
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../pages/contact.html');
    exit;
}


// ---- 1) read the form data ----
// ?? '' = if the field is missing, use empty string
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$subject = trim($_POST['subject'] ?? '(no subject)');
$message = trim($_POST['message'] ?? '');


// ---- 2) validate (again - never trust the browser) ----
$errors = [];
if (strlen($name) < 2) $errors[] = 'Name is too short';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email looks invalid';
if (strlen($message) < 10) $errors[] = 'Message is too short';

if (count($errors) > 0) {
    $errText = urlencode(implode(', ', $errors));
    header('Location: ../pages/contact.html?status=error&reason=' . $errText);
    exit;
}


// ---- 3) clean the data (basic XSS protection) ----
$safeName    = htmlspecialchars($name,    ENT_QUOTES, 'UTF-8');
$safeEmail   = htmlspecialchars($email,   ENT_QUOTES, 'UTF-8');
$safeSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
$safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');


// ---- 4) append the message to messages.txt ----
$entry  = "==============================\n";
$entry .= "Date:    " . date('Y-m-d H:i:s') . "\n";
$entry .= "Name:    $safeName\n";
$entry .= "Email:   $safeEmail\n";
$entry .= "Subject: $safeSubject\n";
$entry .= "Message:\n$safeMessage\n";
$entry .= "==============================\n\n";

$ok = @file_put_contents(__DIR__ . '/messages.txt', $entry, FILE_APPEND | LOCK_EX);

if ($ok === false) {
    header('Location: ../pages/contact.html?status=error&reason=server');
    exit;
}


// ---- 5) (optional) actually send an email - uncomment on a real server ----
/*
$to = 'mtd@gmail.com';
$header = "From: $safeName <$safeEmail>\r\nReply-To: $safeEmail\r\n";
mail($to, $safeSubject, $safeMessage, $header);
*/


// ---- 6) all good - back to the page with success flag ----
header('Location: ../pages/contact.html?status=success');
exit;
