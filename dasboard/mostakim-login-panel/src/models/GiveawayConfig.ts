import mongoose, { Schema, Document } from 'mongoose';

export interface IGiveaway {
  giveawayId: string;
  channelId: string;
  messageId: string;
  prize: string;
  winnerCount: number;
  endsAt: Date;
  ended: boolean;
  winners: string[];
  requirements: { roleId?: string; minMessages?: number };
}

export interface IGiveawayConfig extends Document {
  guildId: string;
  enabled: boolean;
  defaultChannelId: string;
  giveaways: IGiveaway[];
  updatedAt: Date;
}

const GiveawayConfigSchema = new Schema<IGiveawayConfig>(
  {
    guildId:          { type: String, required: true, unique: true, index: true },
    enabled:          { type: Boolean, default: false },
    defaultChannelId: { type: String, default: '' },
    giveaways:        { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.GiveawayConfig ||
  mongoose.model<IGiveawayConfig>('GiveawayConfig', GiveawayConfigSchema);
