'use client';
import { useState, useEffect, use } from 'react';
import { Volume2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; joinToCreateChannelId: string; joinToCreateCategoryId: string;
  defaultLimit: number; defaultBitrate: number; logChannelId: string; autoDeleteEmpty: boolean;
}
const DEFAULT: Config = {
  enabled: false, joinToCreateChannelId: '', joinToCreateCategoryId: '',
  defaultLimit: 0, defaultBitrate: 64000, logChannelId: '', autoDeleteEmpty: true,
};

export default function VoicePage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [voiceChannels, setVoiceChannels] = useState<{ id: string; name: string }[]>([]);
  const [textChannels, setTextChannels] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/settings/voice`).then(r => r.json()),
    ]).then(([ch, cfg]) => {
      setVoiceChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 2));
      setTextChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5));
      setCategories((ch.channels ?? []).filter((c: { type: number }) => c.type === 4));
      const m = { ...DEFAULT, ...cfg }; setConfig(m); setSaved(m);
    });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, val: Config[K]) => setConfig(c => ({ ...c, [key]: val }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/voice`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = { ...DEFAULT, ...data }; setSaved(m); setConfig(m);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Volume2 className="w-6 h-6 text-indigo-400" />}
        iconBg="from-indigo-600/20 to-indigo-600/5"
        title="Voice Manager"
        description="Temporary voice channels that auto-create and delete"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card gradient title="Join To Create" description="Members join this channel to get their own temporary voice channel">
          <div className="space-y-4 mt-2">
            <Select
              label="Trigger Channel"
              value={config.joinToCreateChannelId}
              onChange={v => set('joinToCreateChannelId', v)}
              options={voiceChannels.map(c => ({ value: c.id, label: `🔊 ${c.name}` }))}
              placeholder="Select a voice channel"
            />
            <Select
              label="Created Channels Category"
              value={config.joinToCreateCategoryId}
              onChange={v => set('joinToCreateCategoryId', v)}
              options={categories.map(c => ({ value: c.id, label: `📁 ${c.name}` }))}
              placeholder="Where to put temp channels"
            />
          </div>
        </Card>

        <Card gradient title="Default Settings">
          <div className="space-y-4 mt-2">
            <Input
              label="Default User Limit (0 = unlimited)"
              type="number"
              value={String(config.defaultLimit)}
              onChange={v => set('defaultLimit', Number(v))}
            />
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Default Bitrate</label>
              <div className="flex items-center gap-3 mt-2">
                {[8000, 32000, 64000, 96000, 128000].map(b => (
                  <button
                    key={b}
                    onClick={() => set('defaultBitrate', b)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${config.defaultBitrate === b ? 'bg-violet-600/30 border border-violet-500/40 text-violet-300' : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:bg-white/[0.07]'}`}
                  >
                    {b / 1000}k
                  </button>
                ))}
              </div>
            </div>
            <Select
              label="Voice Log Channel"
              value={config.logChannelId}
              onChange={v => set('logChannelId', v)}
              options={[{ value: '', label: '— None —' }, ...textChannels.map(c => ({ value: c.id, label: `#${c.name}` }))]}
            />
            <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
              <div>
                <p className="text-sm font-medium text-white/80">Auto-Delete Empty Channels</p>
                <p className="text-xs text-white/40">Delete temp channels when all members leave</p>
              </div>
              <Toggle enabled={config.autoDeleteEmpty} onChange={v => set('autoDeleteEmpty', v)} size="sm" />
            </div>
          </div>
        </Card>
      </div>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
