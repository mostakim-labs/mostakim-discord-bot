'use client';
import { useState, useEffect, use } from 'react';
import { Gift, Plus, Trophy, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Giveaway {
  giveawayId: string; channelId: string; prize: string;
  winnerCount: number; endsAt: string; ended: boolean;
}
interface Config { enabled: boolean; defaultChannelId: string; giveaways: Giveaway[] }
const DEFAULT: Config = { enabled: false, defaultChannelId: '', giveaways: [] };

const newGiveaway = (): Giveaway => ({
  giveawayId: Math.random().toString(36).slice(2),
  channelId: '', prize: '', winnerCount: 1,
  endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  ended: false,
});

function timeLeft(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function GiveawaysPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [newGw, setNewGw] = useState<Giveaway>(newGiveaway());
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/settings/giveaways`).then(r => r.json()),
    ]).then(([ch, cfg]) => {
      setChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5));
      const m = { ...DEFAULT, ...cfg, giveaways: cfg.giveaways ?? [] };
      setConfig(m); setSaved(m);
    });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, val: Config[K]) => setConfig(c => ({ ...c, [key]: val }));

  const addGiveaway = () => {
    setConfig(c => ({ ...c, giveaways: [...c.giveaways, { ...newGw }] }));
    setNewGw(newGiveaway());
    setModalOpen(false);
  };

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/giveaways`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = { ...DEFAULT, ...data, giveaways: data.giveaways ?? [] };
      setSaved(m); setConfig(m);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const chOpts = channels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const active = config.giveaways.filter(g => !g.ended);
  const ended = config.giveaways.filter(g => g.ended);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Gift className="w-6 h-6 text-pink-400" />}
        iconBg="from-pink-600/20 to-pink-600/5"
        title="Giveaways"
        description="Create and manage server giveaways"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <div className="flex items-center justify-between">
        <Select label="Default Channel" value={config.defaultChannelId} onChange={v => set('defaultChannelId', v)} options={[{ value: '', label: '— None —' }, ...chOpts]} className="w-64" />
        <button onClick={() => { setNewGw(newGiveaway()); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> New Giveaway
        </button>
      </div>

      {/* Active */}
      {active.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Active Giveaways
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map(g => (
              <Card key={g.giveawayId} gradient>
                <div className="text-center py-2">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-bold text-white text-lg">{g.prize || 'No prize set'}</p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Trophy className="w-3 h-3 text-yellow-400" />{g.winnerCount} winner{g.winnerCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="w-3 h-3 text-blue-400" />{timeLeft(g.endsAt)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setConfig(c => ({ ...c, giveaways: c.giveaways.map(gw => gw.giveawayId === g.giveawayId ? { ...gw, ended: true } : gw) }))}
                      className="flex-1 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                    >
                      End
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-all">
                      Reroll
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ended */}
      {ended.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white/40 mb-3">Ended Giveaways</h3>
          <div className="space-y-2">
            {ended.map(g => (
              <div key={g.giveawayId} className="flex items-center gap-4 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-xl">🎉</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/60 line-through">{g.prize || 'No prize'}</p>
                </div>
                <Badge variant="gray">Ended</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.giveaways.length === 0 && (
        <Card gradient>
          <div className="py-12 text-center">
            <Gift className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-semibold">No giveaways yet</p>
            <p className="text-white/25 text-sm mt-1">Click "New Giveaway" to create one</p>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Giveaway">
        <div className="space-y-4">
          <Input label="Prize" value={newGw.prize} onChange={v => setNewGw(g => ({ ...g, prize: v }))} placeholder="e.g. Nitro Classic" />
          <Select label="Channel" value={newGw.channelId} onChange={v => setNewGw(g => ({ ...g, channelId: v }))} options={chOpts} placeholder="Select channel" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Winners" type="number" value={String(newGw.winnerCount)} onChange={v => setNewGw(g => ({ ...g, winnerCount: Number(v) }))} />
            <Input label="Ends At" type="datetime-local" value={newGw.endsAt} onChange={v => setNewGw(g => ({ ...g, endsAt: v }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all text-sm">Cancel</button>
            <button onClick={addGiveaway} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-all">Create</button>
          </div>
        </div>
      </Modal>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
