
import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const notes = await Notification.find(query).sort({ timestamp: -1 }).limit(100);
    res.json({ ok: true, notifications: notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, type, content } = req.body;
    if (!userId || !type || !content) return res.status(400).json({ error: 'userId, type, content required' });

    const note = await Notification.create({ userId, type, content });
    res.status(201).json({ ok: true, notification: note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Notification.findByIdAndUpdate(id, { status: 'read' }, { new: true });
    res.json({ ok: true, notification: note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
