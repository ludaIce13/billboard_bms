import nodemailer from 'nodemailer';

// Simple reusable email sender. Configure via environment variables.
// Required env vars:
// - SMTP_HOST
// - SMTP_PORT
// - SMTP_USER
// - SMTP_PASS
// - SMTP_FROM (display From address)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST) {
    // Email not configured; fail silently to avoid breaking core flows in dev.
    console.warn('SMTP not configured; skipping email to', to);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}
