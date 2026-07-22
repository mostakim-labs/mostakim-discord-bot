import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  adminId: mongoose.Types.ObjectId;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  ip: string;
  userAgent: string;
  used: boolean;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
  {
    adminId:   { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    otpHash:   { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts:  { type: Number, default: 0 },
    ip:        { type: String, required: true },
    userAgent: { type: String, default: '' },
    used:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete expired OTPs from MongoDB
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
