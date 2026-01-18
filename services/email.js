const nodemailer = require('nodemailer');

// Create transporter based on environment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send confirmation email
async function sendConfirmationEmail(email, token) {
  const confirmUrl = `${process.env.APP_URL || 'http://localhost:3000'}/confirm-email/${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@basement.local',
    to: email,
    subject: 'Confirm Your Email - Basement',
    html: `
      <h2>Confirm Your Email</h2>
      <p>Thank you for signing up! Please confirm your email address by clicking the link below.</p>
      <p>
        <a href="${confirmUrl}" style="background-color: #88FE00; color: #0a0812; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Confirm Email
        </a>
      </p>
      <p>Or copy and paste this link in your browser:</p>
      <p><code>${confirmUrl}</code></p>
      <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
      <p style="color: #666; font-size: 12px;">If you didn't sign up for this account, you can ignore this email.</p>
    `,
    text: `Confirm your email by visiting: ${confirmUrl}\n\nThis link expires in 24 hours.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Error sending confirmation email:', error.message);
    return { success: false, error: error.message };
  }
}

// Send generic email
async function sendEmail(to, subject, html, text) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@basement.local',
    to,
    subject,
    html,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[EMAIL] Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error.message);
    return { success: false, error: error.message };
  }
}

// Test connection
async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified');
    return true;
  } catch (error) {
    console.error('[EMAIL] SMTP connection failed:', error.message);
    return false;
  }
}

module.exports = {
  sendConfirmationEmail,
  sendEmail,
  verifyConnection
};
