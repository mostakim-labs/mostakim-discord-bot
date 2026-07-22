import { NextResponse } from 'next/server';
import { requireAuthResponse } from '@/lib/auth';
import { getGuild } from '@/lib/discord-api';
import { connectDB } from '@/lib/mongodb';
import WelcomeConfig from '@/models/WelcomeConfig';
import LeaveConfig from '@/models/LeaveConfig';
import ModerationConfig from '@/models/ModerationConfig';
import LoggingConfig from '@/models/LoggingConfig';
import TicketConfig from '@/models/TicketConfig';
import AutoRoleConfig from '@/models/AutoRoleConfig';
import ReactionRoleConfig from '@/models/ReactionRoleConfig';
import GiveawayConfig from '@/models/GiveawayConfig';
import VerificationConfig from '@/models/VerificationConfig';
import VoiceConfig from '@/models/VoiceConfig';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ guildId: string }> }
) {
  const auth = await requireAuthResponse();
  if (auth instanceof NextResponse) return auth;

  const { guildId } = await params;

  try {
    const [guild] = await Promise.all([getGuild(guildId), connectDB()]);

    const [welcome, leave, moderation, logging, tickets, autorole, reactionRoles, giveaways, verification, voice] =
      await Promise.all([
        WelcomeConfig.findOne({ guildId }).lean(),
        LeaveConfig.findOne({ guildId }).lean(),
        ModerationConfig.findOne({ guildId }).lean(),
        LoggingConfig.findOne({ guildId }).lean(),
        TicketConfig.findOne({ guildId }).lean(),
        AutoRoleConfig.findOne({ guildId }).lean(),
        ReactionRoleConfig.findOne({ guildId }).lean(),
        GiveawayConfig.findOne({ guildId }).lean(),
        VerificationConfig.findOne({ guildId }).lean(),
        VoiceConfig.findOne({ guildId }).lean(),
      ]);

    const features = {
      welcome:       { enabled: (welcome as { enabled?: boolean } | null)?.enabled ?? false },
      leave:         { enabled: (leave as { enabled?: boolean } | null)?.enabled ?? false },
      moderation:    { enabled: (moderation as { enabled?: boolean } | null)?.enabled ?? false },
      logging:       { enabled: (logging as { enabled?: boolean } | null)?.enabled ?? false },
      tickets:       { enabled: (tickets as { enabled?: boolean } | null)?.enabled ?? false },
      autorole:      { enabled: (autorole as { enabled?: boolean } | null)?.enabled ?? false },
      reactionRoles: { enabled: (reactionRoles as { enabled?: boolean } | null)?.enabled ?? false },
      giveaways:     { enabled: (giveaways as { enabled?: boolean } | null)?.enabled ?? false },
      verification:  { enabled: (verification as { enabled?: boolean } | null)?.enabled ?? false },
      voice:         { enabled: (voice as { enabled?: boolean } | null)?.enabled ?? false },
    };

    return NextResponse.json({ guild, features });
  } catch (err) {
    console.error('Guild detail error:', err);
    return NextResponse.json({ error: 'Failed to fetch guild' }, { status: 500 });
  }
}
