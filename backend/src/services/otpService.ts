import nodemailer from 'nodemailer';

// ─────────────────────────────────────────────────────
// In-memory OTP store (process-scoped, sufficient for single-instance)
// Map<email, { otp, expiresAt, fullName, verified }>
// ─────────────────────────────────────────────────────
interface OtpEntry {
  otp: string;
  expiresAt: number;
  fullName: string;
  verified: boolean;
}

const otpStore = new Map<string, OtpEntry>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const generateAndSendOtp = async (email: string, fullName: string): Promise<void> => {
  // Strict Gmail-only validation
  if (!email.toLowerCase().endsWith('@gmail.com')) {
    throw new Error('Only Gmail addresses (@gmail.com) are allowed to register.');
  }

  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;

  otpStore.set(email.toLowerCase(), { otp, expiresAt, fullName, verified: false });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"WorkBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your WorkBridge Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1,#3b82f6);padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">WorkBridge</h1>
                    <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Two-Way Work Marketplace</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px;font-size:15px;color:#374151;">Hi <strong>${fullName}</strong>,</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                      Your one-time verification code for WorkBridge registration is:
                    </p>
                    <!-- OTP Box -->
                    <div style="background:#f0f4ff;border:2px solid #e0e7ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                      <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#4f46e5;font-family:monospace;">${otp}</span>
                    </div>
                    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
                      This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:16px 40px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#d1d5db;">© 2026 WorkBridge Marketplace · All rights reserved</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};

export const verifyOtp = (email: string, otp: string): { valid: boolean; fullName: string } => {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { valid: false, fullName: '' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, fullName: '' };
  }
  if (entry.otp !== otp.trim()) return { valid: false, fullName: '' };

  // Mark as verified but keep entry so complete-signup can use fullName
  entry.verified = true;
  otpStore.set(email.toLowerCase(), entry);
  return { valid: true, fullName: entry.fullName };
};

export const isOtpVerified = (email: string): { verified: boolean; fullName: string } => {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry || !entry.verified || Date.now() > entry.expiresAt) {
    return { verified: false, fullName: '' };
  }
  return { verified: true, fullName: entry.fullName };
};

export const clearOtp = (email: string): void => {
  otpStore.delete(email.toLowerCase());
};
