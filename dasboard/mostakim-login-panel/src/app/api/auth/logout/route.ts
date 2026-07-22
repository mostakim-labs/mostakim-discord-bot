import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { connectDB } from '@/lib/mongodb';
import LoginLog from '@/models/LoginLog';

function getIP(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const ua = req.headers.get('user-agent') ?? '';
  const token = req.cookies.get('auth_token')?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.type === 'auth') {
      await connectDB();
      await LoginLog.create({ adminId: payload.adminId, event: 'LOGOUT', ip, userAgent: ua, device: '', browser: '' });
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete('auth_token');
  res.cookies.delete('pending_otp');
  return res;
}
