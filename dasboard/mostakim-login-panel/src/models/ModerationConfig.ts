import mongoose, { Schema, Document } from 'mongoose';

export interface IModerationConfig extends Document {
  guildId: string;
  enabled: boolean;
  modRoleIds: string[];
  logChannelId: string;
  // Anti-spam
  antiSpamEnabled: boolean;
  antiSpamThreshold: number;
  antiSpamAction: 'warn' | 'mute' | 'kick' | 'ban';
  antiSpamDuration: number;
  // Anti-link
  antiLinkEnabled: boolean;
  antiLinkWhitelist: string[];
  antiLinkAction: 'delete' | 'warn' | 'kick';
  // Anti-mention
  antiMentionEnabled: boolean;
  antiMentionThreshold: number;
  antiMentionAction: 'warn' | 'mute' | 'kick';
  // Caps filter
  capsFilterEnabled: boolean;
  capsFilterPercent: number;
  // Bad words
  badWordEnabled: boolean;
  badWords: string[];
  // Invite filter
  inviteFilterEnabled: boolean;
  // Anti-raid
  antiRaidEnabled: boolean;
  antiRaidThreshold: number;
  antiRaidAction: 'kick' | 'ban' | 'lockdown';
  // Verification
  verificationEnabled: boolean;
  verificationLevel: 'low' | 'medium' | 'high';
  // Whitelist/blacklist
  whitelistChannelIds: string[];
  blacklistChannelIds: string[];
  whitelistRoleIds: string[];
  updatedAt: Date;
}

const ModerationConfigSchema = new Schema<IModerationConfig>(
  {
    guildId:              { type: String, required: true, unique: true, index: true },
    enabled:              { type: Boolean, default: false },
    modRoleIds:           { type: [String], default: [] },
    logChannelId:         { type: String, default: '' },
    antiSpamEnabled:      { type: Boolean, default: false },
    antiSpamThreshold:    { type: Number, default: 5 },
    antiSpamAction:       { type: String, default: 'warn' },
    antiSpamDuration:     { type: Number, default: 10 },
    antiLinkEnabled:      { type: Boolean, default: false },
    antiLinkWhitelist:    { type: [String], default: [] },
    antiLinkAction:       { type: String, default: 'delete' },
    antiMentionEnabled:   { type: Boolean, default: false },
    antiMentionThreshold: { type: Number, default: 5 },
    antiMentionAction:    { type: String, default: 'warn' },
    capsFilterEnabled:    { type: Boolean, default: false },
    capsFilterPercent:    { type: Number, default: 70 },
    badWordEnabled:       { type: Boolean, default: false },
    badWords:             { type: [String], default: [] },
    inviteFilterEnabled:  { type: Boolean, default: false },
    antiRaidEnabled:      { type: Boolean, default: false },
    antiRaidThreshold:    { type: Number, default: 10 },
    antiRaidAction:       { type: String, default: 'kick' },
    verificationEnabled:  { type: Boolean, default: false },
    verificationLevel:    { type: String, default: 'medium' },
    whitelistChannelIds:  { type: [String], default: [] },
    blacklistChannelIds:  { type: [String], default: [] },
    whitelistRoleIds:     { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ModerationConfig ||
  mongoose.model<IModerationConfig>('ModerationConfig', ModerationConfigSchema);
