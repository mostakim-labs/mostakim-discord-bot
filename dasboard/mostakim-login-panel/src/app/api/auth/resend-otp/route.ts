import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { sendDiscordDM, buildOTPMessage } from '@/lib/discord';
import { verifyToken, signPending } from '@/lib/jwt';
import { rateLimit } from '@/lib/rateLimit';
import Admin from '@/models/Admin';
import OTP from '@/models/OTP';
import LoginLog from '@/models/LoginLog';

function getIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const ua = req.headers.get('user-agent') ?? '';

  const rl = rateLimit(`resend:${ip}`, 3, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: 'Too many resend attempts.' }, { status: 429 });
  }

  const pendingToken = req.cookies.get('pending_otp')?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
  }

  const payload = verifyToken(pendingToken);
  if (!payload || payload.type !== 'pending_otp') {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  await connectDB();
  const admin = await Admin.findById(payload.adminId);
  if (!admin) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });

  await OTP.deleteMany({ adminId: admin._id });

  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const otpDoc = await OTP.create({ adminId: admin._id, otpHash, expiresAt, ip, userAgent: ua });

  const sent = await sendDiscordDM(admin.discordId, buildOTPMessage(otp, ip));
  if (!sent) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return NextResponse.json({ error: 'Failed to send OTP.' }, { status: 500 });
  }

  await LoginLog.create({ adminId: admin._id, event: 'RESEND_OTP', ip, userAgent: ua, device: '', browser: '' });

  const token = signPending({ adminId: String(admin._id), otpId: String(otpDoc._id) });
  const res = NextResponse.json({ success: true });
  res.cookies.set('pending_otp', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 360,
    path: '/',
  });
  return res;
}
