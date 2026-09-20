import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import * as requestService from '../services/requestService';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const { workId, message } = req.body;
    const request = await requestService.createRequest(workId, req.user!.id, message);
    res.status(201).json({ data: request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/incoming', async (req: AuthenticatedRequest, res) => {
  try {
    const requests = await requestService.getIncomingRequests(req.user!.id);
    res.status(200).json({ data: requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/outgoing', async (req: AuthenticatedRequest, res) => {
  try {
    const requests = await requestService.getOutgoingRequests(req.user!.id);
    res.status(200).json({ data: requests });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/accept', async (req: AuthenticatedRequest, res) => {
  try {
    const request = await requestService.acceptRequest(req.params.id, req.user!.id);
    res.status(200).json({ data: request });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/reject', async (req: AuthenticatedRequest, res) => {
  try {
    await requestService.rejectRequest(req.params.id, req.user!.id);
    res.status(200).json({ data: { success: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/cancel', async (req: AuthenticatedRequest, res) => {
  try {
    await requestService.cancelRequest(req.params.id, req.user!.id);
    res.status(200).json({ data: { success: true } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
