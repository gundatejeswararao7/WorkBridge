import { Router } from 'express';
import * as authService from '../services/authService';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const user = await authService.signUp(email, password, fullName);
    res.status(201).json({ data: user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await authService.signIn(email, password);
    res.status(200).json({ data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

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
