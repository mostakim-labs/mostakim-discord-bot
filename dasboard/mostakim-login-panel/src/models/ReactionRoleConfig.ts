import mongoose, { Schema, Document } from 'mongoose';

export type RRType = 'reaction' | 'button' | 'dropdown';

export interface IRREntry {
  emoji: string;
  roleId: string;
  label: string;
  description: string;
  style: 'Primary' | 'Secondary' | 'Success' | 'Danger';
}

export interface IReactionRolePanel {
  panelId: string;
  channelId: string;
  messageId: string;
  title: string;
  description: string;
  color: string;
  type: RRType;
  entries: IRREntry[];
  maxChoices: number;
  requiredRoleId: string;
}

export interface IReactionRoleConfig extends Document {
  guildId: string;
  enabled: boolean;
  panels: IReactionRolePanel[];
  updatedAt: Date;
}

const ReactionRoleConfigSchema = new Schema<IReactionRoleConfig>(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: false },
    panels:  { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.ReactionRoleConfig ||
  mongoose.model<IReactionRoleConfig>('ReactionRoleConfig', ReactionRoleConfigSchema);
