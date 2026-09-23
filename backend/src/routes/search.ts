import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as searchService from '../services/searchService';
import * as profileService from '../services/profileService';

const router = Router();

router.use(authenticate);

router.get('/search', async (req: any, res) => {
  try {
    const query = req.query.q as string;
    const category = req.query.category as string;
    const latitude = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const longitude = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
    const availability = req.query.availability as string;
    const currentUserId = req.user?.id;

    const results = await searchService.searchPeople({
      query,
      category,
      latitude,
      longitude,
      radius,
      availability,
      excludeUserId: currentUserId,
    });
    
    res.status(200).json({ data: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const profile = await profileService.getProfileById(req.params.id);
    res.status(200).json({ data: profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
