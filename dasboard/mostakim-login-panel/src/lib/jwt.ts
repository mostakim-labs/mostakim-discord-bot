import jwt from 'jsonwebtoken';

const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET env var is not set');
  return s;
};

export interface PendingPayload { type: 'pending_otp'; adminId: string; otpId: string }
export interface AuthPayload    { type: 'auth';        adminId: string; mobile: string }

export const signPending = (p: Omit<PendingPayload, 'type'>) =>
  jwt.sign({ ...p, type: 'pending_otp' }, secret(), { expiresIn: '6m' });

export const signAuth = (p: Omit<AuthPayload, 'type'>) =>
  jwt.sign({ ...p, type: 'auth' }, secret(), { expiresIn: '24h' });

export const verifyToken = (token: string): PendingPayload | AuthPayload | null => {
  try { return jwt.verify(token, secret()) as PendingPayload | AuthPayload; }
  catch { return null; }
};
