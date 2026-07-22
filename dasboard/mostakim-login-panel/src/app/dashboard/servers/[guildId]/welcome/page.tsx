'use client';
import { useState, useEffect, use } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ColorPicker from '@/components/ui/ColorPicker';
import SaveBar from '@/components/ui/SaveBar';
import TagInput from '@/components/ui/TagInput';
import EmbedPreview from '@/components/dashboard/EmbedPreview';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'embed', label: 'Embed' },
  { id: 'roles', label: 'Roles & DM' },
  { id: 'preview', label: 'Preview' },
];

const VARIABLES = ['{user}', '{username}', '{server}', '{memberCount}', '{mention}'];

function useChannels(guildId: string) {
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/channels`)
      .then(r => r.json())
      .then(d => setChannels((d.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5)));
  }, [guildId]);
  return channels;
}

function useRoles(guildId: string) {
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/roles`)
      .then(r => r.json())
      .then(d => setRoles((d.roles ?? []).filter((r: { managed: boolean }) => !r.managed)));
  }, [guildId]);
  return roles;
}

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; channelId: string; useEmbed: boolean;
  embedColor: string; embedTitle: string; embedDescription: string;
  embedFooter: string; embedThumbnail: boolean; embedBanner: string;
  plainMessage: string; autoRoleIds: string[]; autoNickname: string;
  dmEnabled: boolean; dmMessage: string;
  buttons: { label: string; url: string; emoji: string }[];
}

const DEFAULT: Config = {
  enabled: false, channelId: '', useEmbed: true,
  embedColor: '#7c3aed', embedTitle: 'Welcome to {server}!',
  embedDescription: 'Hey {mention}, welcome to **{server}**!\nWe now have **{memberCount}** members.',
  embedFooter: '', embedThumbnail: true, embedBanner: '',
  plainMessage: 'Welcome {mention} to {server}!',
  autoRoleIds: [], autoNickname: '', dmEnabled: false,
  dmMessage: 'Welcome to {server}!', buttons: [],
};

export default function WelcomePage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const channels = useChannels(guildId);
  const roles = useRoles(guildId);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [activeTab, setActiveTab] = useState('general');
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/settings/welcome`)
      .then(r => r.json())
      .then(d => { const m = { ...DEFAULT, ...d }; setConfig(m); setSaved(m); });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig(c => ({ ...c, [key]: value }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/welcome`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = { ...DEFAULT, ...data };
      setSaved(m); setConfig(m);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const channelOptions = channels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const roleOptions = roles.map(r => ({ value: r.id, label: `@${r.name}` }));

  const addButton = () => set('buttons', [...config.buttons, { label: 'Click Me', url: '', emoji: '' }]);
  const removeButton = (i: number) => set('buttons', config.buttons.filter((_, idx) => idx !== i));
  const updateButton = (i: number, field: 'label' | 'url' | 'emoji', value: string) =>
    set('buttons', config.buttons.map((b, idx) => idx === i ? { ...b, [field]: value } : b));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MessageSquare className="w-6 h-6 text-violet-400" />}
        title="Welcome System"
        description="Greet new members with a custom message or embed"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Enabled' : 'Disabled'}</Badge>}
        actions={
          <Toggle enabled={config.enabled} onChange={v => set('enabled', v)} size="md" />
        }
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card gradient title="Channel Settings" description="Where to send welcome messages">
            <div className="space-y-4">
              <Select
                label="Welcome Channel"
                value={config.channelId}
                onChange={v => set('channelId', v)}
                options={channelOptions}
                placeholder="Select a channel"
              />
              <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-white/80">Use Embed</p>
                  <p className="text-xs text-white/40">Send as rich embed instead of plain text</p>
                </div>
                <Toggle enabled={config.useEmbed} onChange={v => set('useEmbed', v)} size="sm" />
              </div>
              {!config.useEmbed && (
                <Input
                  label="Plain Message"
                  value={config.plainMessage}
                  onChange={v => set('plainMessage', v)}
                  placeholder="Welcome {mention} to {server}!"
                  multiline rows={3}
                />
              )}
            </div>
          </Card>

          <Card gradient title="Variables" description="Use these in your messages">
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map(v => (
                <button
                  key={v}
                  onClick={() => navigator.clipboard.writeText(v)}
                  className="px-3 py-1.5 bg-violet-600/15 border border-violet-500/20 rounded-lg text-violet-300 text-xs font-mono hover:bg-violet-600/25 transition-all"
                  title="Click to copy"
                >
                  {v}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-3">Click any variable to copy it to clipboard</p>
          </Card>
        </div>
      )}

      {activeTab === 'embed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card gradient title="Embed Content">
              <div className="space-y-4">
                <ColorPicker label="Embed Color" value={config.embedColor} onChange={v => set('embedColor', v)} />
                <Input label="Title" value={config.embedTitle} onChange={v => set('embedTitle', v)} placeholder="Welcome to {server}!" />
                <Input label="Description" value={config.embedDescription} onChange={v => set('embedDescription', v)} multiline rows={4} placeholder="Hey {mention}, welcome!" />
                <Input label="Footer" value={config.embedFooter} onChange={v => set('embedFooter', v)} placeholder="Optional footer text" />
                <Input label="Banner Image URL" value={config.embedBanner} onChange={v => set('embedBanner', v)} placeholder="https://..." />
                <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                  <div>
                    <p className="text-sm font-medium text-white/80">Show Avatar Thumbnail</p>
                    <p className="text-xs text-white/40">Shows the new member's avatar</p>
                  </div>
                  <Toggle enabled={config.embedThumbnail} onChange={v => set('embedThumbnail', v)} size="sm" />
                </div>
              </div>
            </Card>

            <Card gradient title="Buttons" description="Add link buttons below the embed" actions={
              <button onClick={addButton} disabled={config.buttons.length >= 5} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 transition-all disabled:opacity-40">
                <Plus className="w-3 h-3" /> Add
              </button>
            }>
              <div className="space-y-3">
                {config.buttons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={btn.emoji} onChange={e => updateButton(i, 'emoji', e.target.value)} placeholder="😊" className="w-12 bg-white/[0.06] border border-white/10 text-white rounded-xl p-2.5 text-sm text-center focus:outline-none focus:border-violet-500/70" />
                    <input value={btn.label} onChange={e => updateButton(i, 'label', e.target.value)} placeholder="Button label" className="flex-1 bg-white/[0.06] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/70" />
                    <input value={btn.url} onChange={e => updateButton(i, 'url', e.target.value)} placeholder="https://..." className="flex-1 bg-white/[0.06] border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500/70" />
                    <button onClick={() => removeButton(i)} className="w-8 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {config.buttons.length === 0 && <p className="text-xs text-white/30 py-2">No buttons added yet</p>}
              </div>
            </Card>
          </div>

          <Card gradient title="Live Preview" description="How the embed will look">
            <EmbedPreview
              color={config.embedColor}
              title={config.embedTitle}
              description={config.embedDescription}
              footer={config.embedFooter}
              thumbnail={config.embedThumbnail}
              bannerUrl={config.embedBanner}
              useEmbed={config.useEmbed}
              plainMessage={config.plainMessage}
              buttons={config.buttons}
            />
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card gradient title="Auto Role" description="Assign roles when a member joins">
            <div className="space-y-4">
              <TagInput
                label="Roles to assign"
                values={config.autoRoleIds}
                onChange={v => set('autoRoleIds', v)}
                placeholder="Type role ID and press Enter…"
                description="Enter role IDs or pick from below"
              />
              <div className="space-y-2">
                {roleOptions.slice(0, 10).map(r => (
                  <button
                    key={r.value}
                    onClick={() => !config.autoRoleIds.includes(r.value) && set('autoRoleIds', [...config.autoRoleIds, r.value])}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all ${config.autoRoleIds.includes(r.value) ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20' : 'bg-white/[0.04] text-white/60 hover:bg-white/[0.07] border border-white/[0.06]'}`}
                  >
                    <span className="flex-1">{r.label}</span>
                    {config.autoRoleIds.includes(r.value) && <span className="text-xs text-violet-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <Card gradient title="Auto Nickname" description="Set a nickname for new members">
              <Input
                value={config.autoNickname}
                onChange={v => set('autoNickname', v)}
                placeholder="{username} | Member"
              />
            </Card>
            <Card gradient title="DM Welcome" description="Send a private message to new members">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Enable DM Welcome</p>
                    <p className="text-xs text-white/40">Sends a DM when a member joins</p>
                  </div>
                  <Toggle enabled={config.dmEnabled} onChange={v => set('dmEnabled', v)} size="sm" />
                </div>
                {config.dmEnabled && (
                  <Input
                    label="DM Message"
                    value={config.dmMessage}
                    onChange={v => set('dmMessage', v)}
                    multiline rows={3}
                    placeholder="Welcome to {server}!"
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <Card gradient title="Full Preview" description="Complete preview of the welcome message">
          <div className="max-w-2xl">
            <EmbedPreview
              color={config.embedColor}
              title={config.embedTitle}
              description={config.embedDescription}
              footer={config.embedFooter}
              thumbnail={config.embedThumbnail}
              bannerUrl={config.embedBanner}
              useEmbed={config.useEmbed}
              plainMessage={config.plainMessage}
              buttons={config.buttons}
              timestamp
            />
          </div>
        </Card>
      )}

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
