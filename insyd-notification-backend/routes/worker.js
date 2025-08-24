
import Notification from '../models/Notification.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { eventsQueue } from '../server.js';

function renderContent(evt, sourceUser) {
  switch (evt.type) {
    case 'like':
      return `${sourceUser.username} liked your post`;
    case 'comment':
      return `${sourceUser.username} commented: "${evt.data?.text || ''}"`;
    case 'follow':
      return `${sourceUser.username} started following you`;
    case 'post':
      return `${sourceUser.username} published a new post`;
    default:
      return `New activity from ${sourceUser.username}`;
  }
}

export function startWorker() {
  setInterval(async () => {
    if (eventsQueue.length === 0) return;

    // simple FIFO
    const evt = eventsQueue.shift();
    try {
      const sourceUser = await User.findById(evt.sourceUserId);
      if (!sourceUser) return;

      const content = renderContent(evt, sourceUser);

      await Notification.create({
        userId: evt.targetUserId,
        type: evt.type,
        content,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Worker error:', e);
      // In production, push to DLQ
    }
  }, 250); // process ~4 per second (POC)
}
