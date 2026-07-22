import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { getBotGuilds } from '@/lib/discord-api';
import { connectDB } from '@/lib/mongodb';
import LoginLog from '@/models/LoginLog';

export async function GET() {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    const [guilds, totalCommands] = await Promise.allSettled([
      getBotGuilds(),
      connectDB().then(() => LoginLog.countDocuments({ event: 'OTP_VERIFIED' })),
    ]);

    const guildList = guilds.status === 'fulfilled' ? guilds.value : [];
    const totalMembers = guildList.reduce(
      (sum, g) => sum + (g.approximate_member_count ?? 0), 0
    );

    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return NextResponse.json({
      guilds: guildList.length,
      members: totalMembers,
      commands: totalCommands.status === 'fulfilled' ? totalCommands.value : 0,
      uptime,
      memory: {
        used: Math.round(memUsage.rss / 1024 / 1024),
        heap: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
      },
      status: {
        bot: guilds.status === 'fulfilled' ? 'online' : 'offline',
        db: totalCommands.status === 'fulfilled' ? 'online' : 'offline',
        api: 'online',
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
