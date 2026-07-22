import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import ManagedBot from '@/models/ManagedBot';

const DISCORD_API = 'https://discord.com/api/v10';

/* ─── GET: list all managed bots ─── */
export async function GET() {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  await connectDB();
  const bots = await ManagedBot.find({}).lean();
  return NextResponse.json({ bots });
}

/* ─── POST: add a new bot ─── */
export async function POST(req: NextRequest) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    const { token, clientId } = await req.json();
    if (!token || !clientId) {
      return NextResponse.json({ error: 'token and clientId are required' }, { status: 400 });
    }

    // Verify the token by fetching /users/@me from Discord
    const res = await fetch(`${DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bot ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Invalid bot token — Discord rejected it' },
        { status: 400 }
      );
    }

    const botUser = await res.json() as {
      id: string; username: string; avatar: string | null; discriminator: string;
    };

    await connectDB();

    // Check for duplicate
    const existing = await ManagedBot.findOne({ clientId });
    if (existing) {
      return NextResponse.json({ error: 'A bot with this Client ID already exists' }, { status: 409 });
    }

    const bot = await ManagedBot.create({
      token,
      clientId: botUser.id ?? clientId,
      name: botUser.username,
      avatar: botUser.avatar,
      discriminator: botUser.discriminator ?? '0',
      isActive: true,
    });

    return NextResponse.json({
      bot: {
        _id: bot._id,
        clientId: bot.clientId,
        name: bot.name,
        avatar: bot.avatar,
        discriminator: bot.discriminator,
        isActive: bot.isActive,
        addedAt: bot.createdAt,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add bot';
    console.error('Add bot error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
