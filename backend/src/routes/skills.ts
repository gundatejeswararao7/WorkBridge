import { Router } from 'express';
import * as skillService from '../services/skillService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const skills = await skillService.getAllSkills(category);
    res.status(200).json({ data: skills });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
