
import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { eventsQueue } from '../server.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { type, sourceUserId, targetUserId, data } = req.body;

    if (!type || !sourceUserId || !targetUserId) {
      return res.status(400).json({ error: 'type, sourceUserId, targetUserId are required' });
    }

    // Validate users exist (POC)
    const [src, tgt] = await Promise.all([
      User.findById(sourceUserId),
      User.findById(targetUserId)
    ]);
    if (!src || !tgt) return res.status(400).json({ error: 'Invalid userId(s)' });

    const event = await Event.create({ type, sourceUserId, targetUserId, data: data || {} });
    eventsQueue.push(event); // enqueue

    return res.status(201).json({ ok: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
