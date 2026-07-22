import mongoose, { Schema, Document } from 'mongoose';

export interface IEmbedField { name: string; value: string; inline: boolean }
export interface IButton { label: string; url: string; emoji?: string }

export interface IWelcomeConfig extends Document {
  guildId: string;
  enabled: boolean;
  channelId: string;
  useEmbed: boolean;
  embedColor: string;
  embedTitle: string;
  embedDescription: string;
  embedFooter: string;
  embedThumbnail: boolean;
  embedBanner: string;
  embedFields: IEmbedField[];
  plainMessage: string;
  buttons: IButton[];
  autoRoleIds: string[];
  autoNickname: string;
  dmEnabled: boolean;
  dmMessage: string;
  updatedAt: Date;
}

const WelcomeConfigSchema = new Schema<IWelcomeConfig>(
  {
    guildId:         { type: String, required: true, unique: true, index: true },
    enabled:         { type: Boolean, default: false },
    channelId:       { type: String, default: '' },
    useEmbed:        { type: Boolean, default: true },
    embedColor:      { type: String, default: '#7c3aed' },
    embedTitle:      { type: String, default: 'Welcome to {server}!' },
    embedDescription:{ type: String, default: 'Hey {mention}, welcome to **{server}**!\nWe now have **{memberCount}** members.' },
    embedFooter:     { type: String, default: '' },
    embedThumbnail:  { type: Boolean, default: true },
    embedBanner:     { type: String, default: '' },
    embedFields:     { type: [{ name: String, value: String, inline: Boolean }], default: [] },
    plainMessage:    { type: String, default: 'Welcome {mention} to {server}!' },
    buttons:         { type: [{ label: String, url: String, emoji: String }], default: [] },
    autoRoleIds:     { type: [String], default: [] },
    autoNickname:    { type: String, default: '' },
    dmEnabled:       { type: Boolean, default: false },
    dmMessage:       { type: String, default: 'Welcome to {server}!' },
  },
  { timestamps: true }
);

export default mongoose.models.WelcomeConfig ||
  mongoose.model<IWelcomeConfig>('WelcomeConfig', WelcomeConfigSchema);
