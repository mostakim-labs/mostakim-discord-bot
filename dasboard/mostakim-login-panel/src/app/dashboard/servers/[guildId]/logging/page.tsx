'use client';
import { useState, useEffect, use } from 'react';
import { ListChecks } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';

const LOG_GROUPS = [
  {
    label: 'Messages',
    events: ['messageDelete', 'messageEdit', 'messagePin', 'messageUnpin'],
    labels: { messageDelete: 'Message Delete', messageEdit: 'Message Edit', messagePin: 'Message Pin', messageUnpin: 'Message Unpin' },
  },
  {
    label: 'Members',
    events: ['memberJoined', 'memberLeft', 'nicknameChanged', 'userBoost', 'roleAdded', 'roleRemoved'],
    labels: { memberJoined: 'Member Joined', memberLeft: 'Member Left', nicknameChanged: 'Nickname Changed', userBoost: 'Boost', roleAdded: 'Role Added', roleRemoved: 'Role Removed' },
  },
  {
    label: 'Moderation',
    events: ['ban', 'unban', 'kick', 'timeout'],
    labels: { ban: 'Ban', unban: 'Unban', kick: 'Kick', timeout: 'Timeout' },
  },
  {
    label: 'Voice',
    events: ['voiceJoin', 'voiceLeave', 'voiceMove', 'voiceMute', 'voiceUnmute', 'voiceStream', 'voiceCamera'],
    labels: { voiceJoin: 'Voice Join', voiceLeave: 'Voice Leave', voiceMove: 'Voice Move', voiceMute: 'Voice Mute', voiceUnmute: 'Voice Unmute', voiceStream: 'Stream Start', voiceCamera: 'Camera' },
  },
  {
    label: 'Server',
    events: ['channelCreate', 'channelDelete', 'channelUpdate', 'roleUpdated', 'serverUpdate', 'botAdded', 'botRemoved', 'auditLog'],
    labels: { channelCreate: 'Channel Create', channelDelete: 'Channel Delete', channelUpdate: 'Channel Update', roleUpdated: 'Role Updated', serverUpdate: 'Server Update', botAdded: 'Bot Added', botRemoved: 'Bot Removed', auditLog: 'Audit Log' },
  },
  {
    label: 'Extras',
    events: ['emojiCreate', 'emojiDelete', 'stickerCreate', 'stickerDelete', 'inviteCreate', 'inviteDelete', 'webhookCreate', 'webhookDelete'],
    labels: { emojiCreate: 'Emoji Create', emojiDelete: 'Emoji Delete', stickerCreate: 'Sticker Create', stickerDelete: 'Sticker Delete', inviteCreate: 'Invite Create', inviteDelete: 'Invite Delete', webhookCreate: 'Webhook Create', webhookDelete: 'Webhook Delete' },
  },
];

type Status = 'idle' | 'saving' | 'saved' | 'error';

export default function LoggingPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [enabled, setEnabled] = useState(false);
  const [defaultChannelId, setDefaultChannelId] = useState('');
  const [channels, setChannels] = useState<{ event: string; channelId: string }[]>([]);
  const [discordChannels, setDiscordChannels] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState({ enabled: false, defaultChannelId: '', channels: [] as typeof channels });
  const [status, setStatus] = useState<Status>('idle');

  const isDirty = JSON.stringify({ enabled, defaultChannelId, channels }) !== JSON.stringify(saved);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/channels`)
      .then(r => r.json())
      .then(d => setDiscordChannels((d.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5)));
    fetch(`/api/bot/guilds/${guildId}/settings/logging`)
      .then(r => r.json())
      .then(d => {
        setEnabled(d.enabled ?? false);
        setDefaultChannelId(d.defaultChannelId ?? '');
        setChannels(d.channels ?? []);
        setSaved({ enabled: d.enabled ?? false, defaultChannelId: d.defaultChannelId ?? '', channels: d.channels ?? [] });
      });
  }, [guildId]);

  const getChannel = (event: string) =>
    channels.find(c => c.event === event)?.channelId ?? '';

  const setChannel = (event: string, channelId: string) => {
    setChannels(prev => {
      const idx = prev.findIndex(c => c.event === event);
      if (channelId === '') return prev.filter(c => c.event !== event);
      if (idx >= 0) return prev.map(c => c.event === event ? { ...c, channelId } : c);
      return [...prev, { event, channelId }];
    });
  };

  const setGroupChannel = (events: string[], channelId: string) =>
    events.forEach(e => setChannel(e, channelId));

  const channelOptions = [
    { value: '', label: '— Inherit default —' },
    ...discordChannels.map(c => ({ value: c.id, label: `#${c.name}` })),
  ];

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/logging`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, defaultChannelId, channels }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setSaved({ enabled: d.enabled, defaultChannelId: d.defaultChannelId, channels: d.channels });
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ListChecks className="w-6 h-6 text-blue-400" />}
        iconBg="from-blue-600/20 to-blue-600/5"
        title="Logging"
        description="Track every server event in dedicated log channels"
        badge={<Badge variant={enabled ? 'green' : 'gray'} dot>{enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={enabled} onChange={setEnabled} />}
      />

      <Card gradient title="Default Log Channel" description="Used when no specific channel is set for an event">
        <Select
          value={defaultChannelId}
          onChange={setDefaultChannelId}
          options={[{ value: '', label: '— Not set —' }, ...discordChannels.map(c => ({ value: c.id, label: `#${c.name}` }))]}
          placeholder="Select default channel"
        />
      </Card>

      <div className="space-y-4">
        {LOG_GROUPS.map(group => (
          <Card key={group.label} gradient title={group.label} actions={
            <Select
              value=""
              onChange={v => v && setGroupChannel(group.events, v)}
              options={channelOptions}
              placeholder="Set all…"
              className="w-40"
            />
          }>
            <div className="space-y-3 mt-2">
              {group.events.map(event => (
                <div key={event} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-white/70">
                    {(group.labels as unknown as Record<string, string>)[event]}
                  </span>
                  <Select
                    value={getChannel(event)}
                    onChange={v => setChannel(event, v)}
                    options={channelOptions}
                    className="w-44 shrink-0"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => {
        setEnabled(saved.enabled); setDefaultChannelId(saved.defaultChannelId); setChannels(saved.channels);
      }} />
    </div>
  );
}
