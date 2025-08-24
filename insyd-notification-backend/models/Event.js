
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  type: { type: String, enum: ['like','comment','follow','post'], required: true },
  sourceUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now }
});

EventSchema.index({ targetUserId: 1, timestamp: -1 });

export default mongoose.model('Event', EventSchema);
