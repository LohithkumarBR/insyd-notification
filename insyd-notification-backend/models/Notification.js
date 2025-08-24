
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like','comment','follow','post'], required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['unread','read'], default: 'unread' },
  timestamp: { type: Date, default: Date.now }
});

NotificationSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Notification', NotificationSchema);
