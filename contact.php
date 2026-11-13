<?php
/**
 * AKA Motions — contact form handler
 *
 * Receives the contact form (JSON POST from the contact page, /contact) and sends two emails
 * through the Hostinger mailbox:
 *   1. the enquiry  → info@akamotions.com (Reply goes straight to the client)
 *   2. an auto-reply → the person who filled in the form
 *
 * Server layout on Hostinger (everything except this file lives OUTSIDE public_html):
 *
 *   domains/akamotions.com/
 *   ├── contact-config.php        ← SMTP settings + key (copy of _server/contact-config.example.php)
 *   ├── PHPMailer/                ← Exception.php, PHPMailer.php, SMTP.php
 *   └── public_html/
 *       └── contact.php           ← this file
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

use PHPMailer\PHPMailer\PHPMailer;

const SITE_URL  = 'https://akamotions.com';
const LOGO_URL  = 'https://akamotions.com/assets/images/LogoW.png';
const INSTAGRAM = 'https://www.instagram.com/aka_motionnn/';

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

// ---------------------------------------------------------------- request checks
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed']);
}

// Only accept submissions coming from this site's own pages
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, [SITE_URL, 'https://www.akamotions.com'], true)) {
    respond(403, ['error' => 'Forbidden']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST; // fallback for a normal form post
}

// Honeypot: a hidden field real visitors never see. Bots fill it in — pretend it worked.
if (!empty($input['website'])) {
    respond(200, ['ok' => true]);
}

$field = static function (string $key, int $max) use ($input): string {
    $value = trim((string) ($input[$key] ?? ''));
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
};

// Names/email/phone must stay on one line (they end up in email headers)
$oneLine = static fn(string $s): string => trim(preg_replace('/[\r\n\t]+/', ' ', $s) ?? '');

$fname   = $oneLine($field('fname', 60));
$lname   = $oneLine($field('lname', 60));
$email   = $oneLine($field('email', 120));
$phone   = $oneLine($field('phone', 40));
$message = $field('message', 5000);

if ($fname === '' || $lname === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, ['error' => 'Please fill in all required fields with a valid email.']);
}

// ---------------------------------------------------------------- rate limit (5 per IP per hour)
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = sys_get_temp_dir() . '/aka_contact_' . hash('sha256', $ip);
$recent   = [];
if (is_file($rateFile)) {
    $saved  = json_decode((string) file_get_contents($rateFile), true);
    $recent = array_values(array_filter(is_array($saved) ? $saved : [], static fn($t) => is_int($t) && $t > time() - 3600));
}
if (count($recent) >= 5) {
    respond(429, ['error' => 'Too many messages. Please try again later or email info@akamotions.com.']);
}

// ---------------------------------------------------------------- load mailer + config (outside public_html)
$private    = dirname(__DIR__);
$configFile = $private . '/contact-config.php';
$mailerDir  = $private . '/PHPMailer';

if (!is_file($configFile) || !is_file($mailerDir . '/PHPMailer.php')) {
    error_log('Contact form: missing ' . (!is_file($configFile) ? $configFile : $mailerDir . '/PHPMailer.php'));
    respond(500, ['error' => 'Mail is not configured']);
}

require $mailerDir . '/Exception.php';
require $mailerDir . '/PHPMailer.php';
require $mailerDir . '/SMTP.php';
$config = require $configFile;

function mailer(array $config): PHPMailer
{
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = $config['smtp_host'];
    $mail->Port       = (int) $config['smtp_port'];
    $mail->SMTPAuth   = true;
    $mail->SMTPSecure = ((int) $config['smtp_port'] === 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Username   = $config['smtp_user'];
    $mail->Password   = $config['smtp_pass'];
    $mail->CharSet    = PHPMailer::CHARSET_UTF8;
    $mail->XMailer    = ' '; // no "PHPMailer" header
    // Sender address (with Resend, smtp_user is just "resend", so the address is set separately)
    $mail->setFrom($config['from_email'] ?? $config['smtp_user'], $config['from_name'] ?? 'AKA Motions');
    $mail->isHTML(true);
    return $mail;
}

// ---------------------------------------------------------------- email templates
$fullName    = $fname . ' ' . $lname;
$messageHtml = nl2br(h($message));
$phoneText   = $phone !== '' ? $phone : '—';
$sentAt      = date('j M Y, g:i a T');

// Escaped copies for the HTML templates
$eFull  = h($fullName);
$eFname = h($fname);
$eEmail = h($email);
$ePhone = h($phoneText);
$eSent  = h($sentAt);
$eSite  = h(SITE_URL);
$eLogo  = h(LOGO_URL);
$eIg    = h(INSTAGRAM);

$enquiryHtml = <<<HTML
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;color:#111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#000;padding:20px 28px;color:#fff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">New website enquiry</td></tr>
    <tr><td style="padding:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;">
        <tr><td style="color:#888;padding-right:18px;">Name</td><td><strong>{$eFull}</strong></td></tr>
        <tr><td style="color:#888;padding-right:18px;">Email</td><td><a href="mailto:{$eEmail}" style="color:#111;">{$eEmail}</a></td></tr>
        <tr><td style="color:#888;padding-right:18px;">Phone</td><td>{$ePhone}</td></tr>
        <tr><td style="color:#888;padding-right:18px;">Sent</td><td>{$eSent}</td></tr>
      </table>
      <div style="margin-top:22px;padding:18px 20px;background:#f6f6f6;border-radius:10px;font-size:14px;line-height:1.7;">{$messageHtml}</div>
      <p style="margin:22px 0 0;font-size:12px;color:#888;">Hit reply to answer {$eFname} directly.</p>
    </td></tr>
  </table>
</body></html>
HTML;

$enquiryText = "New website enquiry\n\nName: {$fullName}\nEmail: {$email}\nPhone: {$phoneText}\nSent: {$sentAt}\n\n{$message}\n";

$autoReplyHtml = <<<HTML
<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#000;font-family:Helvetica,Arial,sans-serif;color:#fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#0b0b0b;border:1px solid #222;border-radius:14px;overflow:hidden;">
    <tr><td style="padding:34px 32px 10px;">
      <img src="{$eLogo}" alt="AKA Motions" width="72" style="display:block;width:72px;height:auto;border:0;">
    </td></tr>
    <tr><td style="padding:18px 32px 0;">
      <h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:900;letter-spacing:-0.5px;color:#fff;">Thanks, {$eFname}.</h1>
      <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#cfcfcf;">
        We've received your message and we're looking forward to working with you.
        One of us will get back to you within 1–2 business days.
      </p>
    </td></tr>
    <tr><td style="padding:26px 32px 0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;">Your message</div>
      <div style="margin-top:10px;padding:16px 18px;background:#151515;border-radius:10px;font-size:14px;line-height:1.7;color:#e6e6e6;">{$messageHtml}</div>
    </td></tr>
    <tr><td style="padding:28px 32px 0;font-size:15px;line-height:1.7;color:#cfcfcf;">
      — Junior &amp; Justin<br>
      <span style="color:#fff;font-weight:700;">AKA Motions</span> · Where Motion Becomes Cinema.
    </td></tr>
    <tr><td style="padding:28px 32px 32px;">
      <a href="{$eSite}/" style="display:inline-block;background:#fff;color:#000;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:14px 22px;border-radius:8px;">See our work →</a>
    </td></tr>
    <tr><td style="padding:18px 32px;border-top:1px solid #222;font-size:12px;line-height:1.6;color:#777;">
      <a href="{$eSite}" style="color:#999;text-decoration:none;">akamotions.com</a> ·
      <a href="{$eIg}" style="color:#999;text-decoration:none;">Instagram</a> ·
      <a href="mailto:info@akamotions.com" style="color:#999;text-decoration:none;">info@akamotions.com</a><br>
      You're receiving this because you contacted us through akamotions.com.
    </td></tr>
  </table>
</body></html>
HTML;

$autoReplyText = "Thanks, {$fname}.\n\n"
    . "We've received your message and we're looking forward to working with you. "
    . "One of us will get back to you within 1–2 business days.\n\n"
    . "Your message:\n{$message}\n\n"
    . "— Junior & Justin\nAKA Motions · Where Motion Becomes Cinema.\n"
    . SITE_URL . "\n";

// ---------------------------------------------------------------- send
try {
    // 1. Enquiry to the studio
    $enquiry = mailer($config);
    $enquiry->addAddress($config['notify_to']);
    $enquiry->addReplyTo($email, $fullName);
    $enquiry->Subject = "New enquiry from {$fullName}";
    $enquiry->Body    = $enquiryHtml;
    $enquiry->AltBody = $enquiryText;
    $enquiry->send();
} catch (Throwable $e) {
    error_log('Contact form (enquiry): ' . $e->getMessage());
    $body = ['error' => 'Send failed'];
    if (!empty($config['debug'])) {
        $body['detail'] = $e->getMessage(); // only while 'debug' => true in contact-config.php
    }
    respond(500, $body);
}

// Count this submission toward the rate limit only once it actually went out
$recent[] = time();
@file_put_contents($rateFile, json_encode($recent), LOCK_EX);

try {
    // 2. Auto-reply to the visitor (the enquiry already arrived, so a failure here is only logged)
    $autoReply = mailer($config);
    $autoReply->addAddress($email, $fullName);
    $autoReply->addReplyTo($config['reply_to'] ?? $config['notify_to'], 'AKA Motions');
    $autoReply->Subject = 'Thanks for reaching out to AKA Motions';
    $autoReply->Body    = $autoReplyHtml;
    $autoReply->AltBody = $autoReplyText;
    $autoReply->addCustomHeader('Auto-Submitted', 'auto-replied');
    $autoReply->send();
} catch (Throwable $e) {
    error_log('Contact form (auto-reply): ' . $e->getMessage());
}

respond(200, ['ok' => true]);
