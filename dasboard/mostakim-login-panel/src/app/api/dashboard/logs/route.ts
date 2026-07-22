import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import LoginLog from '@/models/LoginLog';

export async function GET(req: NextRequest) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 15;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      LoginLog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      LoginLog.countDocuments({}),
    ]);

    return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Logs API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
