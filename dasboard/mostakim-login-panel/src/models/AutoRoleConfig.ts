import mongoose, { Schema, Document } from 'mongoose';

export interface IAutoRole { roleId: string; target: 'all' | 'humans' | 'bots'; delaySeconds: number }

export interface IAutoRoleConfig extends Document {
  guildId: string;
  enabled: boolean;
  roles: IAutoRole[];
  updatedAt: Date;
}

const AutoRoleConfigSchema = new Schema<IAutoRoleConfig>(
  {
    guildId: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, default: false },
    roles: {
      type: [{ roleId: String, target: { type: String, default: 'all' }, delaySeconds: { type: Number, default: 0 } }],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.AutoRoleConfig ||
  mongoose.model<IAutoRoleConfig>('AutoRoleConfig', AutoRoleConfigSchema);
