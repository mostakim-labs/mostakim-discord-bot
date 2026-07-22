import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { getBotGuilds } from '@/lib/discord-api';

export async function GET() {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    const guilds = await getBotGuilds();
    return NextResponse.json({ guilds });
  } catch (err) {
    console.error('Guilds error:', err);
    return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 });
  }
}
