import mongoose, { Schema, Document } from 'mongoose';

export interface IGuildSettings extends Document {
  guildId: string;
  prefix: string;
  language: string;
  timezone: string;
  updatedAt: Date;
}

const GuildSettingsSchema = new Schema<IGuildSettings>(
  {
    guildId:  { type: String, required: true, unique: true, index: true },
    prefix:   { type: String, default: '!' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
  },
  { timestamps: true }
);

export default mongoose.models.GuildSettings ||
  mongoose.model<IGuildSettings>('GuildSettings', GuildSettingsSchema);
