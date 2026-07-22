'use client';
import { useState, useEffect, use } from 'react';
import { Settings2, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Role {
  id: string; name: string; color: number; hoist: boolean;
  position: number; managed: boolean; mentionable: boolean; permissions: string;
}

function intToHex(n: number): string {
  if (!n) return '#99aab5';
  return `#${n.toString(16).padStart(6, '0')}`;
}

const PERM_FLAGS: Record<string, number> = {
  Administrator: 8,
  'Manage Server': 32,
  'Manage Roles': 0x10000000,
  'Manage Channels': 16,
  'Kick Members': 2,
  'Ban Members': 4,
  'Manage Messages': 8192,
  'Manage Webhooks': 0x20000000,
  'Mention @everyone': 131072,
};

function hasPermission(permStr: string, flag: number): boolean {
  try {
    // Use string comparison to handle large permission integers safely
    const permNum = parseInt(permStr, 10);
    return (permNum & flag) === flag;
  } catch { return false; }
}

export default function RolesPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    const res = await fetch(`/api/bot/guilds/${guildId}/roles`);
    const d = await res.json();
    setRoles(d.roles ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchRoles(); }, [guildId]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Settings2 className="w-6 h-6 text-purple-400" />}
        iconBg="from-purple-600/20 to-purple-600/5"
        title="Role Manager"
        description="View and inspect server roles"
        actions={
          <button onClick={fetchRoles} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white transition-all text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card gradient title={`${roles.length} Roles`}>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {loading && [...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-4 h-4 rounded-full bg-white/10" />
                <div className="h-4 bg-white/10 rounded flex-1" />
              </div>
            ))}
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelected(role)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${selected?.id === role.id ? 'bg-violet-600/20 border border-violet-500/20' : 'hover:bg-white/[0.04] border border-transparent'}`}
              >
                <span className="w-4 h-4 rounded-full shrink-0 border-2 border-white/20" style={{ backgroundColor: intToHex(role.color) }} />
                <span className="text-sm font-medium text-white flex-1 truncate" style={{ color: role.color ? intToHex(role.color) : undefined }}>
                  {role.name}
                </span>
                <div className="flex items-center gap-1">
                  {role.hoist && <Badge variant="blue" size="sm">Hoisted</Badge>}
                  {role.managed && <Badge variant="gray" size="sm">Managed</Badge>}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {selected ? (
          <Card gradient title={`@${selected.name}`}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <span className="w-10 h-10 rounded-2xl shrink-0 border-2 border-white/20" style={{ backgroundColor: intToHex(selected.color) }} />
                <div>
                  <p className="font-bold text-white">{selected.name}</p>
                  <p className="text-xs text-white/40">ID: {selected.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Position', `#${selected.position}`],
                  ['Color', intToHex(selected.color)],
                  ['Hoisted', selected.hoist ? 'Yes' : 'No'],
                  ['Mentionable', selected.mentionable ? 'Yes' : 'No'],
                  ['Bot Managed', selected.managed ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <p className="text-xs text-white/40 mb-1">{k}</p>
                    <p className="text-sm font-semibold text-white">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Key Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PERM_FLAGS).map(([name, flag]) =>
                    hasPermission(selected.permissions, flag) ? (
                      <Badge key={name} variant={name === 'Administrator' ? 'red' : 'violet'} size="sm">{name}</Badge>
                    ) : null
                  )}
                  {!Object.values(PERM_FLAGS).some(f => hasPermission(selected.permissions, f)) && (
                    <p className="text-xs text-white/30">No significant permissions</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card gradient>
            <div className="py-16 text-center">
              <Settings2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a role to inspect</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
