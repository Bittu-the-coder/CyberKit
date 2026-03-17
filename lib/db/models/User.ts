import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'pro' | 'admin';
  profile: {
    displayName: string;
    avatar: string;
    bio: string;
  };
  apiKeys: {
    shodan?: string;
    virustotal?: string;
    hibp?: string;
    censys?: string;
  };
  settings: {
    theme: 'dark' | 'light';
    defaultScope: string[];
    notifications: boolean;
  };
  stats: {
    totalScans: number;
    lastActive: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'pro', 'admin'], default: 'user' },
    profile: {
      displayName: { type: String, default: '' },
      avatar: { type: String, default: '' },
      bio: { type: String, default: '' },
    },
    apiKeys: {
      shodan: { type: String, default: '' },
      virustotal: { type: String, default: '' },
      hibp: { type: String, default: '' },
      censys: { type: String, default: '' },
    },
    settings: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultScope: { type: [String], default: [] },
      notifications: { type: Boolean, default: true },
    },
    stats: {
      totalScans: { type: Number, default: 0 },
      lastActive: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const User = (mongoose.models && mongoose.models.User) || mongoose.model<IUser>('User', UserSchema);
