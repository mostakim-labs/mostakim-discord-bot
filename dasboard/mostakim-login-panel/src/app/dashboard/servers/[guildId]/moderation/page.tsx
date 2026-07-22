'use client';
import { useState, useEffect, use } from 'react';
import { ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';
import TagInput from '@/components/ui/TagInput';
import Tabs from '@/components/ui/Tabs';

const TABS = [
  { id: 'spam', label: 'Anti-Spam' },
  { id: 'content', label: 'Content Filter' },
  { id: 'raid', label: 'Anti-Raid' },
  { id: 'roles', label: 'Roles & Channels' },
];

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; modRoleIds: string[]; logChannelId: string;
  antiSpamEnabled: boolean; antiSpamThreshold: number; antiSpamAction: string; antiSpamDuration: number;
  antiLinkEnabled: boolean; antiLinkWhitelist: string[]; antiLinkAction: string;
  antiMentionEnabled: boolean; antiMentionThreshold: number; antiMentionAction: string;
  capsFilterEnabled: boolean; capsFilterPercent: number;
  badWordEnabled: boolean; badWords: string[];
  inviteFilterEnabled: boolean;
  antiRaidEnabled: boolean; antiRaidThreshold: number; antiRaidAction: string;
  verificationEnabled: boolean; verificationLevel: string;
  whitelistChannelIds: string[]; blacklistChannelIds: string[]; whitelistRoleIds: string[];
}
const DEFAULT: Config = {
  enabled: false, modRoleIds: [], logChannelId: '',
  antiSpamEnabled: false, antiSpamThreshold: 5, antiSpamAction: 'warn', antiSpamDuration: 10,
  antiLinkEnabled: false, antiLinkWhitelist: [], antiLinkAction: 'delete',
  antiMentionEnabled: false, antiMentionThreshold: 5, antiMentionAction: 'warn',
  capsFilterEnabled: false, capsFilterPercent: 70,
  badWordEnabled: false, badWords: [],
  inviteFilterEnabled: false,
  antiRaidEnabled: false, antiRaidThreshold: 10, antiRaidAction: 'kick',
  verificationEnabled: false, verificationLevel: 'medium',
  whitelistChannelIds: [], blacklistChannelIds: [], whitelistRoleIds: [],
};

const ACTION_OPTIONS = [
  { value: 'warn', label: 'Warn' },
  { value: 'mute', label: 'Mute' },
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
];

const RAID_OPTIONS = [
  { value: 'kick', label: 'Kick' },
  { value: 'ban', label: 'Ban' },
  { value: 'lockdown', label: 'Lockdown' },
];

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/85">{label}</p>
        {description && <p className="text-xs text-white/35 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function ModerationPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [activeTab, setActiveTab] = useState('spam');
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/settings/moderation`)
      .then(r => r.json())
      .then(d => { const m = { ...DEFAULT, ...d }; setConfig(m); setSaved(m); });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig(c => ({ ...c, [key]: value }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/moderation`, {
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
        icon={<ShieldCheck className="w-6 h-6 text-orange-400" />}
        iconBg="from-orange-600/20 to-orange-600/5"
        title="Moderation"
        description="Auto-moderation rules and manual moderation tools"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'spam' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card gradient title="Anti-Spam" actions={<Toggle enabled={config.antiSpamEnabled} onChange={v => set('antiSpamEnabled', v)} size="sm" />}>
            <div className="space-y-4 mt-2">
              <Input
                label="Message Threshold (per 5s)"
                type="number"
                value={String(config.antiSpamThreshold)}
                onChange={v => set('antiSpamThreshold', Number(v))}
              />
              <Select
                label="Action"
                value={config.antiSpamAction}
                onChange={v => set('antiSpamAction', v)}
                options={ACTION_OPTIONS}
              />
              {config.antiSpamAction === 'mute' && (
                <Input
                  label="Mute Duration (seconds)"
                  type="number"
                  value={String(config.antiSpamDuration)}
                  onChange={v => set('antiSpamDuration', Number(v))}
                />
              )}
            </div>
          </Card>

          <Card gradient title="Anti-Mention" actions={<Toggle enabled={config.antiMentionEnabled} onChange={v => set('antiMentionEnabled', v)} size="sm" />}>
            <div className="space-y-4 mt-2">
              <Input
                label="Max Mentions per Message"
                type="number"
                value={String(config.antiMentionThreshold)}
                onChange={v => set('antiMentionThreshold', Number(v))}
              />
              <Select
                label="Action"
                value={config.antiMentionAction}
                onChange={v => set('antiMentionAction', v)}
                options={ACTION_OPTIONS}
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card gradient title="Anti-Link" actions={<Toggle enabled={config.antiLinkEnabled} onChange={v => set('antiLinkEnabled', v)} size="sm" />}>
              <div className="space-y-4 mt-2">
                <Select
                  label="Action"
                  value={config.antiLinkAction}
                  onChange={v => set('antiLinkAction', v)}
                  options={[{ value: 'delete', label: 'Delete' }, { value: 'warn', label: 'Warn' }, { value: 'kick', label: 'Kick' }]}
                />
                <TagInput
                  label="Whitelisted Domains"
                  values={config.antiLinkWhitelist}
                  onChange={v => set('antiLinkWhitelist', v)}
                  placeholder="discord.com"
                />
              </div>
            </Card>

            <Card gradient title="Caps Filter" actions={<Toggle enabled={config.capsFilterEnabled} onChange={v => set('capsFilterEnabled', v)} size="sm" />}>
              <div className="space-y-4 mt-2">
                <Input
                  label="Caps Percentage Threshold"
                  type="number"
                  value={String(config.capsFilterPercent)}
                  onChange={v => set('capsFilterPercent', Math.min(100, Math.max(1, Number(v))))}
                  description="Messages with more than this % caps will be flagged"
                />
              </div>
            </Card>
          </div>

          <Card gradient title="Bad Word Filter" actions={<Toggle enabled={config.badWordEnabled} onChange={v => set('badWordEnabled', v)} size="sm" />}>
            <div className="mt-2">
              <TagInput
                label="Blocked Words/Phrases"
                values={config.badWords}
                onChange={v => set('badWords', v)}
                placeholder="word"
                description="Messages containing these words will be deleted"
              />
            </div>
          </Card>

          <Card gradient title="Invite Filter">
            <SettingRow label="Block Discord Invites" description="Delete messages containing discord.gg invite links">
              <Toggle enabled={config.inviteFilterEnabled} onChange={v => set('inviteFilterEnabled', v)} size="sm" />
            </SettingRow>
          </Card>
        </div>
      )}

      {activeTab === 'raid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card gradient title="Anti-Raid" actions={<Toggle enabled={config.antiRaidEnabled} onChange={v => set('antiRaidEnabled', v)} size="sm" />}>
            <div className="space-y-4 mt-2">
              <Input
                label="Join Threshold (per minute)"
                type="number"
                value={String(config.antiRaidThreshold)}
                onChange={v => set('antiRaidThreshold', Number(v))}
                description="Trigger when this many members join within 60 seconds"
              />
              <Select
                label="Action"
                value={config.antiRaidAction}
                onChange={v => set('antiRaidAction', v)}
                options={RAID_OPTIONS}
              />
            </div>
          </Card>

          <Card gradient title="Verification" description="Require new members to verify before accessing the server">
            <SettingRow label="Enable Verification" description="Gate the server behind a verification step">
              <Toggle enabled={config.verificationEnabled} onChange={v => set('verificationEnabled', v)} size="sm" />
            </SettingRow>
            {config.verificationEnabled && (
              <Select
                label="Verification Level"
                value={config.verificationLevel}
                onChange={v => set('verificationLevel', v)}
                className="mt-4"
                options={[
                  { value: 'low', label: 'Low — Button click' },
                  { value: 'medium', label: 'Medium — CAPTCHA' },
                  { value: 'high', label: 'High — Phone verified' },
                ]}
              />
            )}
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <Card gradient title="Moderator Roles" description="Roles that can use moderation commands">
            <TagInput
              values={config.modRoleIds}
              onChange={v => set('modRoleIds', v)}
              placeholder="Paste role ID…"
            />
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card gradient title="Whitelist Channels" description="Auto-mod is disabled in these channels">
              <TagInput values={config.whitelistChannelIds} onChange={v => set('whitelistChannelIds', v)} placeholder="Channel ID…" />
            </Card>
            <Card gradient title="Blacklist Channels" description="Auto-mod is extra strict in these channels">
              <TagInput values={config.blacklistChannelIds} onChange={v => set('blacklistChannelIds', v)} placeholder="Channel ID…" />
            </Card>
          </div>
        </div>
      )}

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
