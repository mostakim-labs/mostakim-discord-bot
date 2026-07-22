import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import LeaveConfig from '@/models/LeaveConfig';
import mongoose from 'mongoose';

type Ctx = { params: Promise<{ guildId: string }> };

/* ── helper: update bot's own GuildConfig collection ── */
async function syncToGuildConfig(guildId: string, body: Record<string, unknown>) {
  try {
    const clientId = (process.env.CLIENT_ID ?? '').split(',')[0].trim();
    if (!clientId) return;

    const colName = `${clientId}.GuildConfig`;

    const GuildConfig =
      mongoose.models[colName] ??
      mongoose.model(
        colName,
        new mongoose.Schema({}, { strict: false, collection: colName })
      );

    await GuildConfig.findOneAndUpdate(
      { Guild: guildId },
      {
        $set: {
          'Farewell.Enable':           !!body.enabled,
          'Farewell.Channel':          body.channelId ?? '',
          'Farewell.Card':             true,
          'Farewell.Embed':            true,
          'Farewell.Content':          '',
          'Farewell.Message':          body.plainMessage ?? '{user:name} left the server.',
          // rich embed fields
          'Farewell.embedColor':       body.embedColor       ?? '#ef4444',
          'Farewell.embedTitle':       body.embedTitle       ?? '👋 {user:name} left the server',
          'Farewell.embedDescription': body.embedDescription ?? '**{user:name}** has left **{guild:name}**.\nWe now have **{guild:membercount}** members.',
          'Farewell.embedFooter':      body.embedFooter      ?? 'Goodbye • {guild:name}',
          'Farewell.embedThumbnail':   body.embedThumbnail   !== false,
          'Farewell.embedBanner':      body.embedBanner      ?? '',
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('[bridge] leave→GuildConfig sync failed:', err);
  }
}

/* ─── GET ─── */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const config = await LeaveConfig.findOne({ guildId }).lean() ?? { guildId };
  return NextResponse.json(config);
}

/* ─── POST ─── */
export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const body = await req.json();

  // 1. Save to dashboard LeaveConfig
  const config = await LeaveConfig.findOneAndUpdate(
    { guildId },
    { ...body, guildId },
    { upsert: true, new: true, runValidators: true }
  );

  // 2. Bridge → bot's GuildConfig
  await syncToGuildConfig(guildId, body);

  return NextResponse.json(config);
}
