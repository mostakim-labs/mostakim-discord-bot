import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import LoginLog from '@/models/LoginLog';

export async function GET() {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    await connectDB();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalLogins, todayLogins, totalFailed, todayFailed, accountLocks, weeklyActivity] =
      await Promise.all([
        LoginLog.countDocuments({ event: 'OTP_VERIFIED' }),
        LoginLog.countDocuments({ event: 'OTP_VERIFIED', createdAt: { $gte: todayStart } }),
        LoginLog.countDocuments({ event: { $in: ['LOGIN_FAILED', 'OTP_FAILED'] } }),
        LoginLog.countDocuments({ event: { $in: ['LOGIN_FAILED', 'OTP_FAILED'] }, createdAt: { $gte: todayStart } }),
        LoginLog.countDocuments({ event: 'ACCOUNT_LOCKED' }),
        LoginLog.aggregate([
          { $match: { createdAt: { $gte: weekStart }, event: 'OTP_VERIFIED' } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return NextResponse.json({ totalLogins, todayLogins, totalFailed, todayFailed, accountLocks, weeklyActivity });
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
