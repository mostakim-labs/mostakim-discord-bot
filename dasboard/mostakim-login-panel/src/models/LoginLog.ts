import mongoose, { Schema, Document } from 'mongoose';

export type LoginEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'RESEND_OTP'
  | 'LOGOUT';

export interface ILoginLog extends Document {
  adminId: mongoose.Types.ObjectId | null;
  event: LoginEvent;
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  createdAt: Date;
}

const LoginLogSchema = new Schema<ILoginLog>(
  {
    adminId:   { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    event:     { type: String, required: true },
    ip:        { type: String, required: true },
    userAgent: { type: String, default: '' },
    device:    { type: String, default: '' },
    browser:   { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.LoginLog || mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);
