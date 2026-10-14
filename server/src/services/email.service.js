const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log('[EmailService] SMTP transporter initialized for host:', host);
  }

  return transporter;
}

/**
 * Send 6-digit OTP email to user's university email address.
 */
async function sendInstituteOtpEmail({ toEmail, otp, instituteName }) {
  const mailTransporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || '"LetMeCook Campus Verification" <verify@letmecook.app>';
  const subject = `Your LetMeCook Verification Code: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Campus Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f4f4f5; margin: 0; padding: 30px; }
          .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .logo { font-size: 20px; font-weight: 800; color: #09090b; margin-bottom: 20px; letter-spacing: -0.5px; }
          .title { font-size: 18px; font-weight: 700; color: #18181b; margin-bottom: 8px; }
          .desc { font-size: 14px; color: #71717a; line-height: 1.5; margin-bottom: 24px; }
          .otp-box { background: #fafafa; border: 2px dashed #d4d4d8; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 24px; }
          .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #09090b; font-family: monospace; }
          .footer { font-size: 12px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 16px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">🍳 LetMeCook</div>
          <div class="title">Verify your Academic Standing</div>
          <div class="desc">
            You requested verification for <strong>${instituteName}</strong>. Enter the 6-digit confirmation code below to verify your campus identity:
          </div>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <div class="desc" style="font-size: 13px; margin-bottom: 0;">
            This code expires in <strong>10 minutes</strong>. Each university email can only be linked to a single LetMeCook account.
          </div>
          <div class="footer">
            If you did not request this verification code, please ignore this email.
          </div>
        </div>
      </body>
    </html>
  `;

  // Always log to terminal so local testing / development works immediately
  console.log('\n======================================================');
  console.log(`[LetMeCook Verification] 🎓 CAMPUS OTP FOR ${toEmail}`);
  console.log(`Institute: ${instituteName}`);
  console.log(`Code:      ${otp}`);
  console.log(`Expires:   10 minutes`);
  console.log('======================================================\n');

  if (mailTransporter) {
    try {
      await mailTransporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlContent
      });
      return { sent: true, mode: 'smtp' };
    } catch (err) {
      console.error('[EmailService] Failed to send SMTP email:', err.message);
      // Fallback to dev log output
      return { sent: true, mode: 'fallback_log', warning: err.message };
    }
  }

  return { sent: true, mode: 'dev_log' };
}

module.exports = {
  sendInstituteOtpEmail
};
