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
import ColorPicker from '@/components/ui/ColorPicker';

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface Config {
  enabled: boolean; type: string; channelId: string; verifiedRoleId: string;
  unverifiedRoleId: string; buttonLabel: string; embedTitle: string;
  embedDescription: string; embedColor: string; kickOnFail: boolean; maxAttempts: number;
}
const DEFAULT: Config = {
  enabled: false, type: 'button', channelId: '', verifiedRoleId: '', unverifiedRoleId: '',
  buttonLabel: 'Verify Me', embedTitle: 'Verification Required',
  embedDescription: 'Click the button below to verify yourself.',
  embedColor: '#7c3aed', kickOnFail: false, maxAttempts: 3,
};

export default function VerificationPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [config, setConfig] = useState<Config>(DEFAULT);
  const [saved, setSaved] = useState<Config>(DEFAULT);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify(config) !== JSON.stringify(saved);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/roles`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/settings/verification`).then(r => r.json()),
    ]).then(([ch, ro, cfg]) => {
      setChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5));
      setRoles((ro.roles ?? []).filter((r: { managed: boolean }) => !r.managed));
      const m = { ...DEFAULT, ...cfg }; setConfig(m); setSaved(m);
    });
  }, [guildId]);

  const set = <K extends keyof Config>(key: K, val: Config[K]) => setConfig(c => ({ ...c, [key]: val }));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const m = { ...DEFAULT, ...data }; setSaved(m); setConfig(m);
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const chOpts = channels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const roleOpts = roles.map(r => ({ value: r.id, label: `@${r.name}` }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ShieldCheck className="w-6 h-6 text-violet-400" />}
        title="Verification"
        description="Gate the server behind a verification step before members can access it"
        badge={<Badge variant={config.enabled ? 'green' : 'gray'} dot>{config.enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={config.enabled} onChange={v => set('enabled', v)} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card gradient title="Verification Settings">
            <div className="space-y-4">
              <Select
                label="Verification Type"
                value={config.type}
                onChange={v => set('type', v)}
                options={[
                  { value: 'button', label: '🔘 Button Click' },
                  { value: 'captcha', label: '🔒 CAPTCHA Challenge' },
                ]}
              />
              <Select label="Verification Channel" value={config.channelId} onChange={v => set('channelId', v)} options={chOpts} placeholder="Where to post the verify panel" />
              <Select label="Verified Role" value={config.verifiedRoleId} onChange={v => set('verifiedRoleId', v)} options={roleOpts} placeholder="Role given after verification" />
              <Select label="Unverified Role (optional)" value={config.unverifiedRoleId} onChange={v => set('unverifiedRoleId', v)} options={[{ value: '', label: '— None —' }, ...roleOpts]} />
            </div>
          </Card>

          <Card gradient title="Button & Behavior">
            <div className="space-y-4">
              <Input label="Button Label" value={config.buttonLabel} onChange={v => set('buttonLabel', v)} />
              <Input label="Max Attempts" type="number" value={String(config.maxAttempts)} onChange={v => set('maxAttempts', Number(v))} description="For CAPTCHA — kick after this many failures" />
              <div className="flex items-center justify-between py-3 border-t border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-white/80">Kick on Verification Failure</p>
                  <p className="text-xs text-white/40">Kick the member if they fail too many times</p>
                </div>
                <Toggle enabled={config.kickOnFail} onChange={v => set('kickOnFail', v)} size="sm" />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card gradient title="Embed Appearance">
            <div className="space-y-4">
              <ColorPicker label="Embed Color" value={config.embedColor} onChange={v => set('embedColor', v)} />
              <Input label="Embed Title" value={config.embedTitle} onChange={v => set('embedTitle', v)} />
              <Input label="Embed Description" value={config.embedDescription} onChange={v => set('embedDescription', v)} multiline rows={4} />
            </div>
          </Card>

          {/* Preview */}
          <Card gradient title="Preview">
            <div className="bg-[#313338] rounded-xl p-4 font-sans">
              <div style={{ borderLeft: `4px solid ${config.embedColor}`, backgroundColor: '#2b2d31', borderRadius: '4px' }} className="p-3 mb-2">
                <p className="text-white font-bold text-sm">{config.embedTitle || 'Verification Required'}</p>
                <p className="text-[#dcddde] text-xs mt-1">{config.embedDescription}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-[#5865F2] text-white text-xs px-4 py-2 rounded font-medium">
                  ✅ {config.buttonLabel}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => setConfig(saved)} />
    </div>
  );
}
