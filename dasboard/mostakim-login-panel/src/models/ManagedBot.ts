import mongoose, { Schema, Document } from 'mongoose';

export interface IManagedBot extends Document {
  token: string;
  clientId: string;
  name: string;
  avatar: string | null;
  discriminator: string;
  isActive: boolean;
  addedAt: Date;
  updatedAt: Date;
}

const ManagedBotSchema = new Schema<IManagedBot>(
  {
    token:         { type: String, required: true, unique: true },
    clientId:      { type: String, required: true },
    name:          { type: String, default: 'Unknown Bot' },
    avatar:        { type: String, default: null },
    discriminator: { type: String, default: '0000' },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ManagedBot ||
  mongoose.model<IManagedBot>('ManagedBot', ManagedBotSchema);
