import nodemailer from 'nodemailer';

// Email service configuration
// Option 1: SendGrid API (Recommended for Render)
// Required env vars:
// - SENDGRID_API_KEY
// - SENDGRID_FROM

// Option 2: SMTP (Alternative)
// Required env vars:
// - SMTP_HOST
// - SMTP_PORT
// - SMTP_USER
// - SMTP_PASS
// - SMTP_FROM

let transporter: nodemailer.Transporter;

// Initialize transporter based on available configuration
if (process.env.SENDGRID_API_KEY) {
  // SendGrid configuration (recommended)
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
  console.log('📧 Using SendGrid for email delivery');
} else if (process.env.SMTP_HOST) {
  // SMTP configuration with timeout handling
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 10000,      // 10 seconds
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });
  console.log('📧 Using SMTP for email delivery');
} else {
  console.warn('⚠️ No email configuration found');
}

export async function sendEmail(to: string, subject: string, html: string) {
  console.log('📧 Email attempt:', { to, subject });
  
  if (!transporter) {
    console.warn('⚠️ Email not configured; skipping email to', to);
    console.warn('Configure either SENDGRID_API_KEY or SMTP_* environment variables');
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SENDGRID_FROM || process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log('✅ Email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}
