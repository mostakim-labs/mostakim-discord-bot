'use client';
import { useState, useEffect, use } from 'react';
import { LogOut } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';
import ColorPicker from '@/components/ui/ColorPicker';
import EmbedPreview from '@/components/dashboard/EmbedPreview';

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; channelId: string; useEmbed: boolean;
  embedColor: string; embedTitle: string; embedDescription: string;
  embedThumbnail: boolean; embedBanner: string; plainMessage: string;
}
const DEFAULT: Config = {
  enabled: false, channelId: '', useEmbed: true,
  embedColor: '#ef4444', embedTitle: 'Goodbye {username}!',
  embedDescription: '**{username}** has left the server. We now have **{memberCount}** members.',
  embedThumbnail: true, embedBanner: '',
  plainMessage: '{username} has left the server.',
};

const VARIABLES = ['{user}', '{username}', '{server}', '{memberCount}'];

export default function LeavePage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json())
      .then(d => setChannels((d.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5)));
    fetch(`/api/bot/guilds/${guildId}/settings/leave`).then(r => r.json())
      .then(d => { const m = { ...DEFAULT, ...d }; setConfig(m); setSaved(m); });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, val: Config[K]) => setConfig(c => ({ ...c, [key]: val }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/leave`, {
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
        icon={<LogOut className="w-6 h-6 text-red-400" />}
        iconBg="from-red-600/20 to-red-600/5"
        title="Leave System"
        description="Send a farewell message when members leave"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card gradient title="Channel Settings">
            <div className="space-y-4">
              <Select
                label="Leave Channel"
                value={config.channelId}
                onChange={v => set('channelId', v)}
                options={channels.map(c => ({ value: c.id, label: `#${c.name}` }))}
                placeholder="Select a channel"
              />
              <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-white/80">Use Embed</p>
                  <p className="text-xs text-white/40">Send as a rich embed</p>
                </div>
                <Toggle enabled={config.useEmbed} onChange={v => set('useEmbed', v)} size="sm" />
              </div>
            </div>
          </Card>

          {config.useEmbed ? (
            <Card gradient title="Embed Settings">
              <div className="space-y-4">
                <ColorPicker label="Embed Color" value={config.embedColor} onChange={v => set('embedColor', v)} />
                <Input label="Title" value={config.embedTitle} onChange={v => set('embedTitle', v)} />
                <Input label="Description" value={config.embedDescription} onChange={v => set('embedDescription', v)} multiline rows={3} />
                <Input label="Banner Image URL" value={config.embedBanner} onChange={v => set('embedBanner', v)} placeholder="https://…" />
                <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                  <p className="text-sm font-medium text-white/80">Show Avatar Thumbnail</p>
                  <Toggle enabled={config.embedThumbnail} onChange={v => set('embedThumbnail', v)} size="sm" />
                </div>
              </div>
            </Card>
          ) : (
            <Card gradient title="Plain Message">
              <Input value={config.plainMessage} onChange={v => set('plainMessage', v)} multiline rows={3} placeholder="{username} has left the server." />
            </Card>
          )}

          <Card gradient title="Variables">
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map(v => (
                <button key={v} onClick={() => navigator.clipboard.writeText(v)} className="px-3 py-1.5 bg-violet-600/15 border border-violet-500/20 rounded-lg text-violet-300 text-xs font-mono hover:bg-violet-600/25 transition-all">
                  {v}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card gradient title="Preview">
          <EmbedPreview
            color={config.embedColor}
            title={config.embedTitle}
            description={config.embedDescription}
            thumbnail={config.embedThumbnail}
            bannerUrl={config.embedBanner}
            useEmbed={config.useEmbed}
            plainMessage={config.plainMessage}
          />
        </Card>
      </div>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
