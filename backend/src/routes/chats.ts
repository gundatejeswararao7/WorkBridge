import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';
import * as chatService from '../services/chatService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.use(authenticate);

// GET /api/chats — list all chats for current user
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const chats = await chatService.getChatsForUser(req.user!.id);
    res.status(200).json({ data: chats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats/:id/messages — get message history for a chat
router.get('/:id/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const messages = await chatService.getMessages(req.params.id, req.user!.id);
    res.status(200).json({ data: messages });
  } catch (err: any) {
    res.status(err.message === 'Unauthorized' ? 403 : 500).json({ error: err.message });
  }
});

// POST /api/chats/:id/messages — send a text message
router.post('/:id/messages', async (req: AuthenticatedRequest, res) => {
  try {
    const { content } = req.body;
    const message = await chatService.sendMessage(req.params.id, req.user!.id, content);
    res.status(201).json({ data: message });
  } catch (err: any) {
    res.status(err.message === 'Unauthorized' ? 403 : 500).json({ error: err.message });
  }
});

// POST /api/chats/:id/upload — upload a file attachment
router.post('/:id/upload', upload.single('file'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const fileResult = await chatService.uploadChatFile(req.params.id, req.user!.id, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    // Also create the message with the file
    const message = await chatService.sendMessage(
      req.params.id,
      req.user!.id,
      undefined,
      fileResult.url,
      fileResult.name,
      fileResult.type
    );

    res.status(201).json({ data: message });
  } catch (err: any) {
    res.status(err.message === 'Unauthorized' ? 403 : 500).json({ error: err.message });
  }
});

export default router;
