import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { getGuildRoles } from '@/lib/discord-api';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  try {
    const roles = await getGuildRoles(guildId);
    return NextResponse.json({ roles: roles.sort((a, b) => b.position - a.position) });
  } catch (err) {
    console.error('Roles error:', err);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}
