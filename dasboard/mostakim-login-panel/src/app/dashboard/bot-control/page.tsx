'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Save, User, Loader2, AlertCircle, CheckCircle2,
  Zap, RefreshCw, Info,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { value: 'online',    label: '🟢 Online' },
  { value: 'idle',      label: '🌙 Idle' },
  { value: 'dnd',       label: '🔴 Do Not Disturb' },
  { value: 'invisible', label: '⚫ Invisible' },
];

const ACTIVITY_OPTIONS = [
  { value: '0', label: '🎮 Playing' },
  { value: '1', label: '📺 Streaming' },
  { value: '2', label: '🎧 Listening' },
  { value: '3', label: '👀 Watching' },
  { value: '4', label: '✏️ Custom Status' },
  { value: '5', label: '🏆 Competing' },
];

const ACTIVITY_PREFIXES: Record<number, string> = {
  0: '🎮 Playing',
  1: '🔴 Live',
  2: '🎧 Listening to',
  3: '📺 Watching',
  4: '✨',
  5: '🏆 Competing in',
};

interface BotUser {
  id: string; username: string; avatar: string | null; discriminator: string;
}
interface Presence {
  status: string; activityType: number; activityName: string; streamingUrl: string;
}

function avatarUrl(bot: BotUser | null): string | null {
  if (!bot?.avatar) return null;
  const ext = bot.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.${ext}?size=256`;
}

const statusDotClass: Record<string, string> = {
  online: 'bg-green-500', idle: 'bg-yellow-500', dnd: 'bg-red-500', invisible: 'bg-gray-600',
};

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function SaveButton({ state, onClick, label = 'Save', savedLabel = 'Saved!' }: {
  state: SaveState; onClick: () => void; label?: string; savedLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={state === 'saving'}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all disabled:opacity-50 ${
        state === 'saved'  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
        state === 'error'  ? 'bg-red-500/20 border-red-500/40 text-red-300' :
        'bg-violet-600/20 border-violet-500/30 text-violet-300 hover:bg-violet-600/30 hover:border-violet-500/50'
      }`}
    >
      {state === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> :
       state === 'saved'  ? <CheckCircle2 className="w-4 h-4" /> :
       state === 'error'  ? <AlertCircle className="w-4 h-4" /> :
       <Save className="w-4 h-4" />}
      {state === 'saving' ? 'Saving…' : state === 'saved' ? savedLabel : state === 'error' ? 'Failed — Retry' : label}
    </button>
  );
}

export default function BotControlPage() {
  const toast = useToast();
  const [bot, setBot] = useState<BotUser | null>(null);
  const [presence, setPresence] = useState<Presence>({
    status: 'online', activityType: 4, activityName: 'Enjoy Every Moment :)', streamingUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SaveState>('idle');
  const [savingProfile, setSavingProfile] = useState<SaveState>('idle');
  const [newUsername, setNewUsername] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/bot/control')
      .then(r => r.json())
      .then(d => {
        if (d.bot) setBot(d.bot);
        if (d.presence) setPresence({
          status:       d.presence.status       ?? 'online',
          activityType: d.presence.activityType ?? 4,
          activityName: d.presence.activityName ?? '',
          streamingUrl: d.presence.streamingUrl ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const savePresence = async () => {
    setSaving('saving');
    try {
      const res = await fetch('/api/bot/control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presence),
      });
      if (!res.ok) throw new Error();
      setSaving('saved');
      toast.success('Status updated!', 'Bot presence applied instantly.');
      setTimeout(() => setSaving('idle'), 3500);
    } catch {
      setSaving('error');
      toast.error('Status update failed', 'Check bot connection and try again.');
      setTimeout(() => setSaving('idle'), 3500);
    }
  };

  const saveProfile = async () => {
    if (!newUsername && !avatarUrlInput) return;
    setSavingProfile('saving');
    try {
      const body: Record<string, string | null> = {};
      if (newUsername) body.username = newUsername;
      if (avatarUrlInput) body.avatarUrl = avatarUrlInput;
      const res = await fetch('/api/bot/control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.discordUser) setBot(data.discordUser);
      setNewUsername(''); setAvatarUrlInput(''); setAvatarPreview(null);
      setSavingProfile('saved');
      toast.success('Profile updated!', 'Changes will reflect on Discord shortly.');
      setTimeout(() => setSavingProfile('idle'), 3500);
    } catch (e: unknown) {
      setSavingProfile('error');
      toast.error('Profile update failed', e instanceof Error ? e.message : 'Discord API error');
      setTimeout(() => setSavingProfile('idle'), 3500);
    }
  };

  const currentAvatar = avatarPreview ?? avatarUrl(bot);

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        icon={<Bot className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />}
        title="Bot Control"
        description="Update your bot's profile, status, and activity in real time"
        badge={<Badge variant={bot ? 'green' : 'gray'} dot>{bot ? 'Connected' : 'Offline'}</Badge>}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-white/30 text-sm">Loading bot info…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* ── Bot Profile ── */}
          <Card gradient title="Bot Profile" description="Change username or avatar">
            <div className="space-y-4">
              {/* Avatar + info */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="relative shrink-0">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-violet-500/40 object-cover" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-white/30" />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#0a0a18] ${statusDotClass[presence.status] ?? 'bg-gray-600'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-lg font-bold text-white truncate">{bot?.username ?? 'Unknown'}</p>
                  <p className="text-xs text-white/40 truncate">ID: {bot?.id ?? '—'}</p>
                  <div className="mt-1.5">
                    <Badge variant={
                      presence.status === 'online' ? 'green' :
                      presence.status === 'idle'   ? 'yellow' :
                      presence.status === 'dnd'    ? 'red' : 'gray'
                    } size="sm" dot>
                      {presence.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Input
                label="New Username"
                value={newUsername}
                onChange={setNewUsername}
                placeholder={bot?.username ?? 'Enter new username'}
              />

              <div className="space-y-2">
                <Input
                  label="Avatar Image URL"
                  value={avatarUrlInput}
                  onChange={v => { setAvatarUrlInput(v); setAvatarPreview(v || null); }}
                  placeholder="https://example.com/avatar.png"
                />
                <AnimatePresence>
                  {avatarPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                    >
                      <img src={avatarPreview} alt="preview" className="w-8 h-8 rounded-lg object-cover" onError={() => setAvatarPreview(null)} />
                      <span className="text-xs text-white/40">Preview</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
                <p className="text-xs text-amber-300/70 leading-relaxed">
                  ⚠️ Discord limits bot username changes to 2 per hour. Avatar changes are applied immediately.
                </p>
              </div>

              <SaveButton
                state={savingProfile}
                onClick={saveProfile}
                label="Update Profile"
                savedLabel="Profile Updated!"
              />
            </div>
          </Card>

          {/* ── Presence / Status ── */}
          <Card gradient title="Status & Activity" description="Changes apply instantly via bot API">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300/80 leading-relaxed">
                  Presence is pushed <strong>instantly</strong> to the bot — no restart needed.
                </p>
              </div>

              <Select
                label="Online Status"
                value={presence.status}
                onChange={v => setPresence(p => ({ ...p, status: v }))}
                options={STATUS_OPTIONS}
              />

              <Select
                label="Activity Type"
                value={String(presence.activityType)}
                onChange={v => setPresence(p => ({ ...p, activityType: Number(v) }))}
                options={ACTIVITY_OPTIONS}
              />

              <Input
                label="Activity Text"
                value={presence.activityName}
                onChange={v => setPresence(p => ({ ...p, activityName: v }))}
                placeholder={
                  presence.activityType === 4 ? 'e.g. 🚀 Powered by MOSTAKIM' :
                  presence.activityType === 0 ? 'e.g. MOSTAKIM Dashboard' :
                  presence.activityType === 3 ? 'e.g. 150 Servers' :
                  presence.activityType === 2 ? 'e.g. /help' :
                  presence.activityType === 5 ? 'e.g. a Tournament' :
                  'Activity name…'
                }
              />

              <AnimatePresence>
                {presence.activityType === 1 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Input
                      label="Streaming URL (Twitch or YouTube)"
                      value={presence.streamingUrl}
                      onChange={v => setPresence(p => ({ ...p, streamingUrl: v }))}
                      placeholder="https://twitch.tv/yourstream"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <SaveButton
                state={saving}
                onClick={savePresence}
                label="Save Presence"
                savedLabel="Applied Instantly!"
              />
            </div>
          </Card>

          {/* ── Discord Preview ── */}
          <div className="lg:col-span-2">
            <Card gradient title="Discord Preview" description="How your bot appears in Discord's member list">
              <div className="bg-[#2b2d31] rounded-2xl p-3 sm:p-4">
                {/* Channel header simulation */}
                <div className="mb-3 pb-2 border-b border-white/[0.06]">
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider"># general — Members</p>
                </div>

                {/* Bot member row */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all cursor-pointer">
                  <div className="relative shrink-0">
                    {currentAvatar ? (
                      <img src={currentAvatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-600/40 flex items-center justify-center text-white font-bold text-sm">B</div>
                    )}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#2b2d31] ${statusDotClass[presence.status] ?? 'bg-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">
                        {newUsername || bot?.username || 'BOT NAME'}
                      </span>
                      <span className="px-1.5 py-px rounded text-[10px] font-bold bg-[#5865f2] text-white shrink-0">APP</span>
                    </div>
                    <p className="text-xs text-[#b5bac1] mt-0.5 truncate">
                      <span className="font-medium">{ACTIVITY_PREFIXES[presence.activityType] ?? ''}</span>
                      {presence.activityType !== 4 && ' '}
                      {presence.activityName || <span className="opacity-50">No activity set</span>}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
