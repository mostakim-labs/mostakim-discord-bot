import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveConfig extends Document {
  guildId: string;
  enabled: boolean;
  channelId: string;
  useEmbed: boolean;
  embedColor: string;
  embedTitle: string;
  embedDescription: string;
  embedThumbnail: boolean;
  embedBanner: string;
  plainMessage: string;
  updatedAt: Date;
}

const LeaveConfigSchema = new Schema<ILeaveConfig>(
  {
    guildId:         { type: String, required: true, unique: true, index: true },
    enabled:         { type: Boolean, default: false },
    channelId:       { type: String, default: '' },
    useEmbed:        { type: Boolean, default: true },
    embedColor:      { type: String, default: '#ef4444' },
    embedTitle:      { type: String, default: 'Goodbye {username}!' },
    embedDescription:{ type: String, default: '**{username}** has left the server. We now have **{memberCount}** members.' },
    embedThumbnail:  { type: Boolean, default: true },
    embedBanner:     { type: String, default: '' },
    plainMessage:    { type: String, default: '{username} has left the server.' },
  },
  { timestamps: true }
);

export default mongoose.models.LeaveConfig ||
  mongoose.model<ILeaveConfig>('LeaveConfig', LeaveConfigSchema);
