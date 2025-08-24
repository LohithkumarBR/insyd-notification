
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import eventsRouter from './routes/events.js';
import notificationsRouter from './routes/notifications.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insyd_poc';

// In-memory events queue (POC)
export const eventsQueue = [];

// Mongo
mongoose.connect(MONGODB_URI, { })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/events', eventsRouter);
app.use('/notifications', notificationsRouter);

// Seed mock users on first run (POC)
import User from './models/User.js';
async function seedUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create([
      { username: 'alice', email: 'alice@example.com', preferences: { inApp: true } },
      { username: 'bob', email: 'bob@example.com', preferences: { inApp: true } },
    ]);
    console.log('Seeded mock users: alice, bob');
  }
}
seedUsers();

// Start worker to process queue
import { startWorker } from './routes/worker.js';
startWorker();

app.get('/', (req, res) => res.send({ ok: true, service: 'insyd-notification-backend' }));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
