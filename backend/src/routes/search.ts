import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as searchService from '../services/searchService';

const router = Router();

router.use(authenticate);

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    const category = req.query.category as string;
    const latitude = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const longitude = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
    const availability = req.query.availability as string;

    const results = await searchService.searchPeople({
      query,
      category,
      latitude,
      longitude,
      radius,
      availability
    });
    
    res.status(200).json({ data: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
