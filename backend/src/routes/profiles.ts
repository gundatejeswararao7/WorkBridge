import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import * as profileService from '../services/profileService';

const router = Router();

router.use(authenticate);

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await profileService.getProfile(req.user!.id);
    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me', async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await profileService.updateProfile(req.user!.id, req.body);
    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/me/skills', async (req: AuthenticatedRequest, res) => {
  try {
    const skillIds = req.body.skillIds || req.body.skill_ids || [];
    const skills = await profileService.updateUserSkills(req.user!.id, skillIds);
    res.status(200).json({ data: skills });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/me/photo', async (req: AuthenticatedRequest, res) => {
  try {
    const photoData = req.body.photo || req.body.photo_data;
    const filename = req.body.filename || 'avatar.jpg';
    const mimetype = req.body.mimetype || 'image/jpeg';
    
    if (!photoData) {
      return res.status(400).json({ error: 'Missing photo data' });
    }
    
    // Convert base64 to buffer
    const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const url = await profileService.uploadProfilePhoto(req.user!.id, {
      buffer,
      mimetype,
      originalname: filename
    });
    
    res.status(200).json({ data: { url } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
