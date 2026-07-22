import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  mobile: string;
  passwordHash: string;
  discordId: string;
  isActive: boolean;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    mobile:       { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    discordId:    { type: String, required: true },
    isActive:     { type: Boolean, default: true },
    lockedUntil:  { type: Date, default: null },
  },
  { timestamps: true }
);

AdminSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
