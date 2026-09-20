import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import * as workService from '../services/workService';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      status: req.query.status as string,
    };
    const works = await workService.getWorks(filters);
    res.status(200).json({ data: works });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const workData = { ...req.body, creator_id: req.user!.id };
    const work = await workService.createWork(workData);
    res.status(201).json({ data: work });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/giving', async (req: AuthenticatedRequest, res) => {
  try {
    const works = await workService.getWorksGiving(req.user!.id);
    res.status(200).json({ data: works });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/taking', async (req: AuthenticatedRequest, res) => {
  try {
    const works = await workService.getWorksTaking(req.user!.id);
    res.status(200).json({ data: works });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const work = await workService.getWorkById(req.params.id);
    res.status(200).json({ data: work });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const work = await workService.updateWork(req.params.id, req.user!.id, req.body);
    res.status(200).json({ data: work });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    await workService.deleteWork(req.params.id, req.user!.id);
    res.status(200).json({ data: { success: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
