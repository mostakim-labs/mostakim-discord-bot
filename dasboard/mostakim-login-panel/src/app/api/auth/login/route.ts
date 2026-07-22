import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { sendDiscordDM, buildOTPMessage } from '@/lib/discord';
import { signPending } from '@/lib/jwt';
import { rateLimit } from '@/lib/rateLimit';
import Admin from '@/models/Admin';
import OTP from '@/models/OTP';
import LoginLog from '@/models/LoginLog';

function getIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
}

function normalizeMobile(m: string) {
  return m.replace(/[\s\-+]/g, '');
}

async function seedAdmin() {
  const mobile = process.env.ADMIN_MOBILE;
  const password = process.env.ADMIN_PASSWORD;
  const discordId = process.env.ADMIN_DISCORD_ID;
  if (!mobile || !password || !discordId) return;

  const normalized = normalizeMobile(mobile);
  const exists = await Admin.findOne({ mobile: normalized });
  if (!exists) {
    const hash = await bcrypt.hash(password, 12);
    await Admin.create({ mobile: normalized, passwordHash: hash, discordId });
    console.log('[Dashboard] Admin seeded:', normalized);
  }
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const ua = req.headers.get('user-agent') ?? '';

  // Rate limit: 5 attempts per IP per 15 min
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  let body: { mobile?: string; password?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const { mobile, password } = body;

  if (!password || password.trim().length < 6) {
    return NextResponse.json({ error: 'Password is required (min 6 characters).' }, { status: 400 });
  }

  // Validate mobile only if provided
  if (mobile && mobile.trim() && !/^\d{7,15}$/.test(normalizeMobile(mobile))) {
    return NextResponse.json({ error: 'Invalid mobile number.' }, { status: 400 });
  }

  await connectDB();
  await seedAdmin();

  // Find admin: by mobile if given, otherwise by ADMIN_DISCORD_ID env, otherwise first active admin
  let admin;
  if (mobile && mobile.trim()) {
    admin = await Admin.findOne({ mobile: normalizeMobile(mobile) });
  } else {
    const discordId = process.env.ADMIN_DISCORD_ID;
    if (discordId) {
      admin = await Admin.findOne({ discordId });
    } else {
      admin = await Admin.findOne({ isActive: true });
    }
  }

  if (!admin || !admin.isActive) {
    await LoginLog.create({ event: 'LOGIN_FAILED', ip, userAgent: ua, device: '', browser: '' });
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Check if locked
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const mins = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json({ error: `Account locked. Try again in ${mins} minutes.` }, { status: 423 });
  }

  const valid = await admin.comparePassword(password);
  if (!valid) {
    await LoginLog.create({ adminId: admin._id, event: 'LOGIN_FAILED', ip, userAgent: ua, device: '', browser: '' });
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }

  // Invalidate previous OTPs
  await OTP.deleteMany({ adminId: admin._id });

  // Generate OTP
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpDoc = await OTP.create({ adminId: admin._id, otpHash, expiresAt, ip, userAgent: ua });

  // Send Discord DM
  const sent = await sendDiscordDM(admin.discordId, buildOTPMessage(otp, ip));
  if (!sent) {
    await OTP.deleteOne({ _id: otpDoc._id });
    return NextResponse.json({ error: 'Failed to send OTP via Discord DM. Check bot permissions.' }, { status: 500 });
  }

  await LoginLog.create({ adminId: admin._id, event: 'OTP_SENT', ip, userAgent: ua, device: '', browser: '' });

  // Set pending cookie
  const token = signPending({ adminId: String(admin._id), otpId: String(otpDoc._id) });
  const res = NextResponse.json({ success: true });
  res.cookies.set('pending_otp', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 360,
    path: '/',
  });
  return res;
}
