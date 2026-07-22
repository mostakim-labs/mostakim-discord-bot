'use client';
import { useState, useEffect, use } from 'react';
import { UserCheck, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';

type Status = 'idle' | 'saving' | 'saved' | 'error';
interface AutoRole { roleId: string; target: string; delaySeconds: number }

const TARGET_OPTIONS = [
  { value: 'all', label: 'Everyone' },
  { value: 'humans', label: 'Humans Only' },
  { value: 'bots', label: 'Bots Only' },
];

export default function AutoRolePage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [enabled, setEnabled] = useState(false);
  const [roles, setRoles] = useState<AutoRole[]>([]);
  const [discordRoles, setDiscordRoles] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState({ enabled: false, roles: [] as AutoRole[] });
  const [status, setStatus] = useState<Status>('idle');
  const isDirty = JSON.stringify({ enabled, roles }) !== JSON.stringify(saved);

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/roles`).then(r => r.json())
      .then(d => setDiscordRoles((d.roles ?? []).filter((r: { managed: boolean }) => !r.managed)));
    fetch(`/api/bot/guilds/${guildId}/settings/autorole`).then(r => r.json())
      .then(d => {
        setEnabled(d.enabled ?? false);
        setRoles(d.roles ?? []);
        setSaved({ enabled: d.enabled ?? false, roles: d.roles ?? [] });
      });
  }, [guildId]);

  const addRole = () => setRoles(r => [...r, { roleId: '', target: 'all', delaySeconds: 0 }]);
  const removeRole = (i: number) => setRoles(r => r.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: keyof AutoRole, val: string | number) =>
    setRoles(r => r.map((role, idx) => idx === i ? { ...role, [field]: val } : role));

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/autorole`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, roles }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setSaved({ enabled: d.enabled, roles: d.roles });
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const roleOptions = discordRoles.map(r => ({ value: r.id, label: `@${r.name}` }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<UserCheck className="w-6 h-6 text-green-400" />}
        iconBg="from-green-600/20 to-green-600/5"
        title="Auto Role"
        description="Automatically assign roles when members join"
        badge={<Badge variant={enabled ? 'green' : 'gray'} dot>{enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={enabled} onChange={setEnabled} />}
      />

      <Card gradient
        title="Auto Roles"
        description="Configure which roles to assign and to whom"
        actions={
          <button onClick={addRole} disabled={roles.length >= 10} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 transition-all disabled:opacity-40">
            <Plus className="w-3.5 h-3.5" /> Add Role
          </button>
        }
      >
        <div className="space-y-3 mt-2">
          {roles.length === 0 && (
            <p className="text-center text-white/30 text-sm py-8">No auto roles configured. Click "Add Role" to get started.</p>
          )}
          {roles.map((role, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <Select
                value={role.roleId}
                onChange={v => updateRole(i, 'roleId', v)}
                options={roleOptions}
                placeholder="Select role"
                className="flex-1"
              />
              <Select
                value={role.target}
                onChange={v => updateRole(i, 'target', v)}
                options={TARGET_OPTIONS}
                className="w-36"
              />
              <div className="w-28 shrink-0">
                <Input
                  type="number"
                  value={String(role.delaySeconds)}
                  onChange={v => updateRole(i, 'delaySeconds', Number(v))}
                  placeholder="0"
                />
              </div>
              <span className="text-xs text-white/30 shrink-0">sec delay</span>
              <button onClick={() => removeRole(i)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => { setEnabled(saved.enabled); setRoles(saved.roles); }} />
    </div>
  );
}
