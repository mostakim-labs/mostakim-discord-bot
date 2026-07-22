import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { sendDiscordDM, buildLockMessage } from '@/lib/discord';
import { verifyToken, signAuth } from '@/lib/jwt';
import Admin from '@/models/Admin';
import OTP from '@/models/OTP';
import LoginLog from '@/models/LoginLog';

function getIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const ua = req.headers.get('user-agent') ?? '';

  const pendingToken = req.cookies.get('pending_otp')?.value;
  if (!pendingToken) {
    return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
  }

  const payload = verifyToken(pendingToken);
  if (!payload || payload.type !== 'pending_otp') {
    return NextResponse.json({ error: 'Invalid session. Please login again.' }, { status: 401 });
  }

  let body: { otp?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const { otp } = body;
  if (!otp || !/^\d{4}$/.test(otp)) {
    return NextResponse.json({ error: 'Enter a valid 4-digit code.' }, { status: 400 });
  }

  await connectDB();

  const otpDoc = await OTP.findById(payload.otpId);
  const admin  = await Admin.findById(payload.adminId);

  if (!otpDoc || !admin || otpDoc.used) {
    return NextResponse.json({ error: 'OTP expired or already used. Please login again.' }, { status: 401 });
  }

  if (new Date() > otpDoc.expiresAt) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return NextResponse.json({ error: 'OTP expired. Please login again.' }, { status: 401 });
  }

  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();

  const valid = await bcrypt.compare(otp, otpDoc.otpHash);

  if (!valid) {
    await LoginLog.create({ adminId: admin._id, event: 'OTP_FAILED', ip, userAgent: ua, device: '', browser: '' });

    if (otpDoc.attempts >= 5) {
      // Lock account for 15 minutes
      admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await admin.save();
      await OTP.deleteOne({ _id: otpDoc._id });
      await LoginLog.create({ adminId: admin._id, event: 'ACCOUNT_LOCKED', ip, userAgent: ua, device: '', browser: '' });

      await sendDiscordDM(admin.discordId, buildLockMessage(ip));

      const res = NextResponse.json(
        { error: 'Account locked for 15 minutes due to too many failed attempts.' },
        { status: 423 }
      );
      res.cookies.delete('pending_otp');
      return res;
    }

    const remaining = 5 - otpDoc.attempts;
    return NextResponse.json(
      { error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`, attempts: otpDoc.attempts },
      { status: 401 }
    );
  }

  // Success — consume OTP
  otpDoc.used = true;
  await otpDoc.save();
  await OTP.deleteOne({ _id: otpDoc._id });

  await LoginLog.create({ adminId: admin._id, event: 'OTP_VERIFIED', ip, userAgent: ua, device: '', browser: '' });

  const authToken = signAuth({ adminId: String(admin._id), mobile: admin.mobile });

  const res = NextResponse.json({ success: true });
  res.cookies.delete('pending_otp');
  res.cookies.set('auth_token', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
  return res;
}
