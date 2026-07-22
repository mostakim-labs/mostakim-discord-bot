'use client';
import { useState, useEffect, use } from 'react';
import { Hash } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';
import ColorPicker from '@/components/ui/ColorPicker';
import TagInput from '@/components/ui/TagInput';
import Tabs from '@/components/ui/Tabs';

const TABS = [
  { id: 'panel', label: 'Panel Setup' },
  { id: 'behavior', label: 'Behavior' },
  { id: 'roles', label: 'Support Roles' },
];

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; panelChannelId: string; categoryId: string;
  transcriptChannelId: string; logChannelId: string; supportRoleIds: string[];
  buttonLabel: string; buttonEmoji: string; panelTitle: string;
  panelDescription: string; panelColor: string; ticketMessage: string;
  closeOnLeave: boolean; autoDeleteSeconds: number; maxOpenPerUser: number; requireTopic: boolean;
}
const DEFAULT: Config = {
  enabled: false, panelChannelId: '', categoryId: '', transcriptChannelId: '', logChannelId: '',
  supportRoleIds: [], buttonLabel: 'Open Ticket', buttonEmoji: '🎫',
  panelTitle: 'Support Tickets', panelDescription: 'Click the button below to open a support ticket.',
  panelColor: '#7c3aed', ticketMessage: 'Hello {mention}! Support will be with you shortly.',
  closeOnLeave: false, autoDeleteSeconds: 0, maxOpenPerUser: 1, requireTopic: false,
};

export default function TicketsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState('panel');
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/roles`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/settings/tickets`).then(r => r.json()),
    ]).then(([ch, ro, cfg]) => {
      setChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5));
      setCategories((ch.channels ?? []).filter((c: { type: number }) => c.type === 4));
      setRoles((ro.roles ?? []).filter((r: { managed: boolean }) => !r.managed));
      const m = { ...DEFAULT, ...cfg }; setConfig(m); setSaved(m);
    });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, val: Config[K]) => setConfig(c => ({ ...c, [key]: val }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/tickets`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = { ...DEFAULT, ...data }; setSaved(m); setConfig(m);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const chOpts = channels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const catOpts = categories.map(c => ({ value: c.id, label: `📁 ${c.name}` }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Hash className="w-6 h-6 text-cyan-400" />}
        iconBg="from-cyan-600/20 to-cyan-600/5"
        title="Ticket System"
        description="Create a support ticket system for your server"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'panel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card gradient title="Panel Settings">
              <div className="space-y-4">
                <Select label="Panel Channel" value={config.panelChannelId} onChange={v => set('panelChannelId', v)} options={chOpts} placeholder="Where to post the panel" />
                <Select label="Ticket Category" value={config.categoryId} onChange={v => set('categoryId', v)} options={catOpts} placeholder="Category for new tickets" />
                <Select label="Transcript Channel" value={config.transcriptChannelId} onChange={v => set('transcriptChannelId', v)} options={chOpts} placeholder="Where to save transcripts" />
                <Select label="Log Channel" value={config.logChannelId} onChange={v => set('logChannelId', v)} options={chOpts} placeholder="Where to log ticket actions" />
              </div>
            </Card>
            <Card gradient title="Embed Appearance">
              <div className="space-y-4">
                <ColorPicker label="Embed Color" value={config.panelColor} onChange={v => set('panelColor', v)} />
                <Input label="Panel Title" value={config.panelTitle} onChange={v => set('panelTitle', v)} />
                <Input label="Panel Description" value={config.panelDescription} onChange={v => set('panelDescription', v)} multiline rows={3} />
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card gradient title="Open Button">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input label="Button Emoji" value={config.buttonEmoji} onChange={v => set('buttonEmoji', v)} className="w-24 shrink-0" placeholder="🎫" />
                  <Input label="Button Label" value={config.buttonLabel} onChange={v => set('buttonLabel', v)} className="flex-1" />
                </div>
              </div>
            </Card>
            <Card gradient title="Ticket Welcome Message">
              <Input
                value={config.ticketMessage}
                onChange={v => set('ticketMessage', v)}
                multiline rows={4}
                description="Sent when a new ticket is opened. Use {mention}"
              />
            </Card>

            {/* Preview */}
            <div className="bg-[#313338] rounded-xl p-4 font-sans">
              <div style={{ borderLeft: `4px solid ${config.panelColor}`, backgroundColor: '#2b2d31', borderRadius: '4px' }} className="p-3">
                <p className="text-white font-bold text-sm">{config.panelTitle || 'Support Tickets'}</p>
                <p className="text-[#dcddde] text-xs mt-1">{config.panelDescription || 'Click to open a ticket'}</p>
              </div>
              <button className="mt-2 bg-[#5865F2] text-white text-xs px-4 py-2 rounded font-medium">
                {config.buttonEmoji} {config.buttonLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'behavior' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card gradient title="Ticket Behavior">
            <div className="space-y-1">
              {([
                ['closeOnLeave', 'Close ticket when member leaves', 'Automatically close the ticket if the member leaves the server'],
                ['requireTopic', 'Require ticket topic', 'Member must provide a reason before opening a ticket'],
              ] as [keyof Config, string, string][]).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white/85">{label}</p>
                    <p className="text-xs text-white/35">{desc}</p>
                  </div>
                  <Toggle enabled={config[key] as boolean} onChange={v => set(key, v as Config[typeof key])} size="sm" />
                </div>
              ))}
              <div className="py-3.5 space-y-3">
                <Input
                  label="Max Open Tickets per User"
                  type="number"
                  value={String(config.maxOpenPerUser)}
                  onChange={v => set('maxOpenPerUser', Number(v))}
                />
                <Input
                  label="Auto-Delete Delay (seconds, 0 = never)"
                  type="number"
                  value={String(config.autoDeleteSeconds)}
                  onChange={v => set('autoDeleteSeconds', Number(v))}
                  description="Seconds to wait before deleting closed tickets"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <Card gradient title="Support Roles" description="Roles that can see and manage all tickets">
          <div className="space-y-3">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => set('supportRoleIds', config.supportRoleIds.includes(r.id)
                  ? config.supportRoleIds.filter(id => id !== r.id)
                  : [...config.supportRoleIds, r.id]
                )}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition-all ${
                  config.supportRoleIds.includes(r.id)
                    ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                    : 'bg-white/[0.04] border border-white/[0.06] text-white/60 hover:bg-white/[0.07]'
                }`}
              >
                <span className="flex-1 text-left">@{r.name}</span>
                {config.supportRoleIds.includes(r.id) && <span className="text-violet-400 text-xs font-bold">✓ Selected</span>}
              </button>
            ))}
          </div>
        </Card>
      )}

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
