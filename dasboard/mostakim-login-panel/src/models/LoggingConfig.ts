import mongoose, { Schema, Document } from 'mongoose';

export type LogEvent =
  | 'messageDelete' | 'messageEdit' | 'messagePin' | 'messageUnpin'
  | 'roleAdded' | 'roleRemoved' | 'roleUpdated'
  | 'memberJoined' | 'memberLeft' | 'nicknameChanged' | 'userBoost'
  | 'ban' | 'unban' | 'kick' | 'timeout'
  | 'voiceJoin' | 'voiceLeave' | 'voiceMove' | 'voiceMute' | 'voiceUnmute'
  | 'voiceStream' | 'voiceCamera'
  | 'emojiCreate' | 'emojiDelete' | 'stickerCreate' | 'stickerDelete'
  | 'inviteCreate' | 'inviteDelete'
  | 'webhookCreate' | 'webhookDelete'
  | 'channelCreate' | 'channelDelete' | 'channelUpdate'
  | 'categoryCreate' | 'categoryDelete' | 'categoryUpdate'
  | 'serverUpdate' | 'auditLog' | 'botAdded' | 'botRemoved';

export interface ILogChannel { event: LogEvent; channelId: string }

export interface ILoggingConfig extends Document {
  guildId: string;
  enabled: boolean;
  defaultChannelId: string;
  channels: ILogChannel[];
  updatedAt: Date;
}

const LoggingConfigSchema = new Schema<ILoggingConfig>(
  {
    guildId:          { type: String, required: true, unique: true, index: true },
    enabled:          { type: Boolean, default: false },
    defaultChannelId: { type: String, default: '' },
    channels:         { type: [{ event: String, channelId: String }], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.LoggingConfig ||
  mongoose.model<ILoggingConfig>('LoggingConfig', LoggingConfigSchema);
