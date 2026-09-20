import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import * as reviewService from '../services/reviewService';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const reviewData = { ...req.body, reviewer_id: req.user!.id };
    const review = await reviewService.createReview(reviewData);
    res.status(201).json({ data: review });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/user/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const reviews = await reviewService.getReviewsForUser(req.params.id);
    res.status(200).json({ data: reviews });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
