'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, ShieldCheck, ListChecks, UserCheck, Hash,
  Smile, Volume2, Gift, Star, Megaphone, Settings2, LogOut,
  CheckCircle2, XCircle, Users, Globe, Shield, ChevronRight, RefreshCw
} from 'lucide-react';
import { guildIconUrl, guildBannerUrl } from '@/lib/discord-api';

interface FeatureCard {
  key: string; label: string; description: string; icon: React.ElementType; color: string;
}

const FEATURES: FeatureCard[] = [
  { key: 'welcome',        label: 'Welcome System',    description: 'Greet new members',        icon: MessageSquare, color: 'from-violet-600/20 to-violet-600/5' },
  { key: 'leave',          label: 'Leave System',      description: 'Farewell messages',         icon: LogOut,        color: 'from-red-600/20 to-red-600/5' },
  { key: 'moderation',     label: 'Moderation',        description: 'Auto-mod & actions',        icon: ShieldCheck,   color: 'from-orange-600/20 to-orange-600/5' },
  { key: 'logging',        label: 'Logging',           description: 'Track server events',       icon: ListChecks,    color: 'from-blue-600/20 to-blue-600/5' },
  { key: 'autorole',       label: 'Auto Role',         description: 'Assign roles on join',      icon: UserCheck,     color: 'from-green-600/20 to-green-600/5' },
  { key: 'tickets',        label: 'Tickets',           description: 'Support ticket system',     icon: Hash,          color: 'from-cyan-600/20 to-cyan-600/5' },
  { key: 'reaction-roles', label: 'Reaction Roles',    description: 'Self-assignable roles',     icon: Smile,         color: 'from-yellow-600/20 to-yellow-600/5' },
  { key: 'verification',   label: 'Verification',      description: 'Member verification',       icon: Shield,        color: 'from-violet-600/20 to-blue-600/5' },
  { key: 'voice',          label: 'Voice Manager',     description: 'Temp voice channels',       icon: Volume2,       color: 'from-indigo-600/20 to-indigo-600/5' },
  { key: 'giveaways',      label: 'Giveaways',         description: 'Run giveaways',             icon: Gift,          color: 'from-pink-600/20 to-pink-600/5' },
  { key: 'embed-builder',  label: 'Embed Builder',     description: 'Create rich embeds',        icon: Star,          color: 'from-amber-600/20 to-amber-600/5' },
  { key: 'announcements',  label: 'Announcements',     description: 'Broadcast messages',        icon: Megaphone,     color: 'from-teal-600/20 to-teal-600/5' },
  { key: 'roles',          label: 'Role Manager',      description: 'Create & manage roles',     icon: Settings2,     color: 'from-purple-600/20 to-purple-600/5' },
  { key: 'channels',       label: 'Channel Manager',   description: 'Manage channels',           icon: Hash,          color: 'from-sky-600/20 to-sky-600/5' },
];

const VERIFICATION_LEVELS = ['None', 'Low', 'Medium', 'High', 'Very High'];

export default function ServerHubPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [data, setData] = useState<{ guild: Record<string, unknown>; features: Record<string, { enabled: boolean }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}`);
      const json = await res.json();
      if (!json.error) setData(json);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [guildId]);

  const guild = data?.guild as Record<string, unknown> | undefined;
  const features = data?.features ?? {};
  const enabledCount = Object.values(features).filter(f => f.enabled).length;
  const iconUrl = guild ? guildIconUrl(guildId, guild.icon as string | null, 256) : null;
  const bannerUrl = guild ? guildBannerUrl(guildId, guild.banner as string | null, 640) : null;

  return (
    <div className="space-y-6">
      {/* Server header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grad-border overflow-hidden">
        <div className="glass rounded-[20px] overflow-hidden">
          {bannerUrl && (
            <div className="h-28 sm:h-36 relative">
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent" />
            </div>
          )}
          <div className="p-5 flex flex-col sm:flex-row sm:items-end gap-4">
            {loading ? (
              <div className="w-20 h-20 rounded-2xl bg-white/10 animate-pulse" />
            ) : (
              <img src={iconUrl!} alt={guild?.name as string} className="w-20 h-20 rounded-2xl ring-4 ring-[#0a0a18] shrink-0 -mt-10 relative" />
            )}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-7 bg-white/10 rounded w-48 animate-pulse" />
                  <div className="h-4 bg-white/5 rounded w-32 animate-pulse" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-extrabold text-white truncate">{guild?.name as string}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Users className="w-3 h-3" />
                      {(guild?.member_count as number | undefined)?.toLocaleString() ?? '—'} members
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Globe className="w-3 h-3" />
                      {guild?.preferred_locale as string}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Shield className="w-3 h-3" />
                      {VERIFICATION_LEVELS[(guild?.verification_level as number) ?? 0]} verification
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-extrabold grad-text">{enabledCount}</p>
                <p className="text-xs text-white/30">{FEATURES.length} features</p>
              </div>
              <button
                onClick={() => { setRefreshing(true); fetchData(); }}
                disabled={refreshing || loading}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          const enabled = features[feature.key]?.enabled ?? false;
          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.01 }}
              className="grad-border group"
            >
              <Link href={`/dashboard/servers/${guildId}/${feature.key}`}>
                <div className="glass rounded-[20px] p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} border border-white/10 shrink-0`}>
                    <Icon className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">{feature.label}</p>
                    <p className="text-xs text-white/40">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {loading ? (
                      <div className="w-14 h-5 bg-white/10 rounded-full animate-pulse" />
                    ) : enabled ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />ON
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-white/30">
                        <XCircle className="w-3.5 h-3.5" />OFF
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
