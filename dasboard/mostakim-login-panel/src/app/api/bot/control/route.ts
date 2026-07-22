import { NextRequest, NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { discordFetch } from '@/lib/discord-api';
import BotPresence from '@/models/BotPresence';

/** Push presence to bot instantly via its internal HTTP server */
async function pushPresenceToBotNow(data: {
  status: string;
  activityType: number;
  activityName: string;
  streamingUrl?: string;
}) {
  try {
    await fetch('http://127.0.0.1:3001/internal/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      // Short timeout — if bot not reachable, we already saved to DB so 30s poll covers it
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Bot internal server unreachable — not a hard error; DB polling will sync within 30s
    console.warn('[bot-control] Internal push failed — DB polling will catch up');
  }
}

/* ─── GET: bot info + current presence config ─── */
export async function GET() {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    const [botUser, presenceDoc] = await Promise.allSettled([
      discordFetch<{ id: string; username: string; avatar: string | null; discriminator: string }>('/users/@me'),
      connectDB().then(() => BotPresence.findOne({}).lean()),
    ]);

    return NextResponse.json({
      bot: botUser.status === 'fulfilled' ? botUser.value : null,
      presence: presenceDoc.status === 'fulfilled' ? presenceDoc.value : null,
    });
  } catch (err) {
    console.error('Bot control GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch bot info' }, { status: 500 });
  }
}

/* ─── PATCH: update bot username / avatar / presence ─── */
export async function PATCH(req: NextRequest) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const results: Record<string, unknown> = {};

    // 1. Update Discord user (username / avatar)
    if (body.username !== undefined || body.avatarUrl !== undefined) {
      const payload: Record<string, string | null> = {};

      if (body.username) payload.username = body.username;

      if (body.avatarUrl) {
        const imgRes = await fetch(body.avatarUrl);
        if (!imgRes.ok) throw new Error('Failed to fetch avatar image');
        const buffer = await imgRes.arrayBuffer();
        const b64 = Buffer.from(buffer).toString('base64');
        const contentType = imgRes.headers.get('content-type') ?? 'image/png';
        payload.avatar = `data:${contentType};base64,${b64}`;
      }

      if (body.avatarUrl === null) payload.avatar = null;

      if (Object.keys(payload).length > 0) {
        const updated = await discordFetch('/users/@me', {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        results.discordUser = updated;
      }
    }

    // 2. Save presence config to MongoDB + push instantly to bot
    if (body.status !== undefined || body.activityType !== undefined || body.activityName !== undefined) {
      await connectDB();

      const presenceUpdate = {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.activityType !== undefined && { activityType: body.activityType }),
        ...(body.activityName !== undefined && { activityName: body.activityName }),
        ...(body.streamingUrl !== undefined && { streamingUrl: body.streamingUrl }),
      };

      const presence = await BotPresence.findOneAndUpdate(
        {},
        presenceUpdate,
        { upsert: true, new: true }
      );
      results.presence = presence;

      // Push instantly (non-blocking — DB polling is the fallback)
      const latestDoc = presence.toObject();
      pushPresenceToBotNow({
        status:       latestDoc.status,
        activityType: latestDoc.activityType,
        activityName: latestDoc.activityName,
        streamingUrl: latestDoc.streamingUrl,
      });
    }

    return NextResponse.json({ success: true, ...results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    console.error('Bot control PATCH error:', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
