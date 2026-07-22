import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import WelcomeConfig from '@/models/WelcomeConfig';
import mongoose from 'mongoose';

type Ctx = { params: Promise<{ guildId: string }> };

/* ── helper: update bot's own GuildConfig collection ── */
async function syncToGuildConfig(guildId: string, body: Record<string, unknown>) {
  try {
    // Bot namespaces collections as  "<CLIENT_ID>.<CollectionName>"
    const clientId = (process.env.CLIENT_ID ?? '').split(',')[0].trim();
    if (!clientId) return;

    const colName = `${clientId}.GuildConfig`;

    // Get or create the model (mongoose caches by name)
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
          'Welcome.Enable':           !!body.enabled,
          'Welcome.Channel':          body.channelId ?? '',
          'Welcome.Card':             true,          // always on (card + embed)
          'Welcome.Embed':            true,
          'Welcome.Content':          '{user:mention}',
          'Welcome.Message':          body.plainMessage ?? 'Welcome {user:mention} to {guild:name}!',
          // rich embed fields (read by new welcome.mjs)
          'Welcome.embedColor':       body.embedColor       ?? '#7c3aed',
          'Welcome.embedTitle':       body.embedTitle       ?? '✨ Welcome to {guild:name}!',
          'Welcome.embedDescription': body.embedDescription ?? 'Hey {user:mention}, welcome! You are member **#{guild:membercount}**.',
          'Welcome.embedFooter':      body.embedFooter      ?? 'Member #{guild:membercount}',
          'Welcome.embedThumbnail':   body.embedThumbnail   !== false,
          'Welcome.embedBanner':      body.embedBanner      ?? '',
          'Welcome.dmEnabled':        !!body.dmEnabled,
          'Welcome.dmMessage':        body.dmMessage        ?? '',
          'Welcome.autoRoleIds':      body.autoRoleIds      ?? [],
          'Welcome.autoNickname':     body.autoNickname     ?? '',
          'Welcome.buttons':          body.buttons          ?? [],
        },
      },
      { upsert: true }
    );

    // Bust cache key used by guild.fetchData()
    // (cache TTL is 30 s anyway — nothing extra needed)
  } catch (err) {
    console.error('[bridge] welcome→GuildConfig sync failed:', err);
  }
}

/* ─── GET ─── */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const config = await WelcomeConfig.findOne({ guildId }).lean() ?? { guildId };
  return NextResponse.json(config);
}

/* ─── POST ─── */
export async function POST(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;
  const { guildId } = await params;
  await connectDB();
  const body = await req.json();

  // 1. Save to dashboard WelcomeConfig
  const config = await WelcomeConfig.findOneAndUpdate(
    { guildId },
    { ...body, guildId },
    { upsert: true, new: true, runValidators: true }
  );

  // 2. Bridge → bot's GuildConfig (same MongoDB, different collection)
  await syncToGuildConfig(guildId, body);

  return NextResponse.json(config);
}
