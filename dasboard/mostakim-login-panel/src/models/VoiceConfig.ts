import mongoose, { Schema, Document } from 'mongoose';

export interface IVoiceConfig extends Document {
  guildId: string;
  enabled: boolean;
  joinToCreateChannelId: string;
  joinToCreateCategoryId: string;
  defaultLimit: number;
  defaultBitrate: number;
  logChannelId: string;
  autoDeleteEmpty: boolean;
  updatedAt: Date;
}

const VoiceConfigSchema = new Schema<IVoiceConfig>(
  {
    guildId:                { type: String, required: true, unique: true, index: true },
    enabled:                { type: Boolean, default: false },
    joinToCreateChannelId:  { type: String, default: '' },
    joinToCreateCategoryId: { type: String, default: '' },
    defaultLimit:           { type: Number, default: 0 },
    defaultBitrate:         { type: Number, default: 64000 },
    logChannelId:           { type: String, default: '' },
    autoDeleteEmpty:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.VoiceConfig ||
  mongoose.model<IVoiceConfig>('VoiceConfig', VoiceConfigSchema);
