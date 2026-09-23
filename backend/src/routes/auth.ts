import { Router } from 'express';
import * as authService from '../services/authService';
import * as otpService from '../services/otpService';

const router = Router();

// ── Step 1: Send OTP ──────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and full name are required.' });
    }
    await otpService.generateAndSendOtp(email.trim(), fullName.trim());
    res.status(200).json({ data: { message: 'OTP sent to your Gmail address.' } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Step 2: Verify OTP ────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required.' });
    }
    const result = otpService.verifyOtp(email.trim(), otp.trim());
    if (!result.valid) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });
    }
    res.status(200).json({ data: { message: 'OTP verified successfully.', fullName: result.fullName } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Step 3: Complete signup (after OTP verified) ──────────
router.post('/complete-signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const { verified, fullName } = otpService.isOtpVerified(email.trim());
    if (!verified) {
      return res.status(403).json({ error: 'Email not verified. Please complete OTP verification first.' });
    }

    const user = await authService.signUp(email.trim(), password, fullName);
    otpService.clearOtp(email.trim());
    res.status(201).json({ data: user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Login ─────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.signIn(email, password);
    res.status(200).json({ data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ── Reset Password ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    await authService.resetPassword(email);
    res.status(200).json({ data: { message: 'Password reset email sent' } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
