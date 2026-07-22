import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { getGuildChannels } from '@/lib/discord-api';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  try {
    const channels = await getGuildChannels(guildId);
    return NextResponse.json({ channels });
  } catch (err) {
    console.error('Channels error:', err);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }
}
