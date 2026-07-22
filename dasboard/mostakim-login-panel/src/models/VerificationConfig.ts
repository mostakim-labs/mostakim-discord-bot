import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationConfig extends Document {
  guildId: string;
  enabled: boolean;
  type: 'button' | 'captcha';
  channelId: string;
  verifiedRoleId: string;
  unverifiedRoleId: string;
  buttonLabel: string;
  embedTitle: string;
  embedDescription: string;
  embedColor: string;
  kickOnFail: boolean;
  maxAttempts: number;
  updatedAt: Date;
}

const VerificationConfigSchema = new Schema<IVerificationConfig>(
  {
    guildId:           { type: String, required: true, unique: true, index: true },
    enabled:           { type: Boolean, default: false },
    type:              { type: String, default: 'button' },
    channelId:         { type: String, default: '' },
    verifiedRoleId:    { type: String, default: '' },
    unverifiedRoleId:  { type: String, default: '' },
    buttonLabel:       { type: String, default: 'Verify Me' },
    embedTitle:        { type: String, default: 'Verification Required' },
    embedDescription:  { type: String, default: 'Click the button below to verify yourself.' },
    embedColor:        { type: String, default: '#7c3aed' },
    kickOnFail:        { type: Boolean, default: false },
    maxAttempts:       { type: Number, default: 3 },
  },
  { timestamps: true }
);

export default mongoose.models.VerificationConfig ||
  mongoose.model<IVerificationConfig>('VerificationConfig', VerificationConfigSchema);
