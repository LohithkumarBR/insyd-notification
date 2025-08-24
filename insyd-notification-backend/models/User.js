
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    inApp: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
