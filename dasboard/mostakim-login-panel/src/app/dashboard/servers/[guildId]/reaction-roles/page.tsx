'use client';
import { useState, useEffect, use } from 'react';
import { Smile, Plus, Trash2, Edit3 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Toggle from '@/components/ui/Toggle';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SaveBar from '@/components/ui/SaveBar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ColorPicker from '@/components/ui/ColorPicker';

type RRType = 'reaction' | 'button' | 'dropdown';
type Status = 'idle' | 'saving' | 'saved' | 'error';

interface RREntry { emoji: string; roleId: string; label: string; description: string; style: string }
interface Panel {
  panelId: string; channelId: string; title: string; description: string;
  color: string; type: RRType; entries: RREntry[]; maxChoices: number; requiredRoleId: string;
}

const TYPE_OPTIONS = [
  { value: 'reaction', label: '⭐ Reaction Roles' },
  { value: 'button', label: '🔘 Button Roles' },
  { value: 'dropdown', label: '📋 Dropdown Roles' },
];

const STYLE_OPTIONS = [
  { value: 'Primary', label: 'Blue (Primary)' },
  { value: 'Secondary', label: 'Grey (Secondary)' },
  { value: 'Success', label: 'Green (Success)' },
  { value: 'Danger', label: 'Red (Danger)' },
];

const newPanel = (): Panel => ({
  panelId: Math.random().toString(36).slice(2),
  channelId: '', title: 'Role Selection', description: 'Pick your roles below',
  color: '#7c3aed', type: 'button', entries: [], maxChoices: 0, requiredRoleId: '',
});

const newEntry = (): RREntry => ({ emoji: '⭐', roleId: '', label: 'New Role', description: '', style: 'Primary' });

export default function ReactionRolesPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [enabled, setEnabled] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [discordChannels, setDiscordChannels] = useState<{ id: string; name: string }[]>([]);
  const [discordRoles, setDiscordRoles] = useState<{ id: string; name: string }[]>([]);
  const [saved, setSaved] = useState({ enabled: false, panels: [] as Panel[] });
  const [status, setStatus] = useState<Status>('idle');
  const [editPanel, setEditPanel] = useState<Panel | null>(null);
  const [editIdx, setEditIdx] = useState(-1);
  const isDirty = JSON.stringify({ enabled, panels }) !== JSON.stringify(saved);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bot/guilds/${guildId}/channels`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/roles`).then(r => r.json()),
      fetch(`/api/bot/guilds/${guildId}/settings/reaction-roles`).then(r => r.json()),
    ]).then(([ch, ro, cfg]) => {
      setDiscordChannels((ch.channels ?? []).filter((c: { type: number }) => c.type === 0 || c.type === 5));
      setDiscordRoles((ro.roles ?? []).filter((r: { managed: boolean }) => !r.managed));
      setEnabled(cfg.enabled ?? false);
      setPanels(cfg.panels ?? []);
      setSaved({ enabled: cfg.enabled ?? false, panels: cfg.panels ?? [] });
    });
  }, [guildId]);

  const save = async () => {
    setStatus('saving');
    try {
      const res = await fetch(`/api/bot/guilds/${guildId}/settings/reaction-roles`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled, panels }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setSaved({ enabled: d.enabled, panels: d.panels });
      setStatus('saved'); setTimeout(() => setStatus('idle'), 3000);
    } catch { setStatus('error'); setTimeout(() => setStatus('idle'), 3000); }
  };

  const openNew = () => { setEditPanel(newPanel()); setEditIdx(-1); };
  const openEdit = (panel: Panel, i: number) => { setEditPanel({ ...panel }); setEditIdx(i); };
  const closeModal = () => { setEditPanel(null); setEditIdx(-1); };
  const savePanel = () => {
    if (!editPanel) return;
    if (editIdx >= 0) setPanels(p => p.map((panel, i) => i === editIdx ? editPanel : panel));
    else setPanels(p => [...p, editPanel]);
    closeModal();
  };
  const deletePanel = (i: number) => setPanels(p => p.filter((_, idx) => idx !== i));

  const chOptions = discordChannels.map(c => ({ value: c.id, label: `#${c.name}` }));
  const roleOptions = discordRoles.map(r => ({ value: r.id, label: `@${r.name}` }));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Smile className="w-6 h-6 text-yellow-400" />}
        iconBg="from-yellow-600/20 to-yellow-600/5"
        title="Reaction Roles"
        description="Let members self-assign roles via reactions, buttons, or dropdowns"
        badge={<Badge variant={enabled ? 'green' : 'gray'} dot>{enabled ? 'Active' : 'Disabled'}</Badge>}
        actions={<Toggle enabled={enabled} onChange={setEnabled} />}
      />

      <div className="flex justify-end">
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> New Panel
        </button>
      </div>

      {panels.length === 0 && (
        <Card gradient>
          <div className="py-12 text-center">
            <Smile className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-semibold">No panels yet</p>
            <p className="text-white/25 text-sm mt-1">Create a panel to start assigning roles</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {panels.map((panel, i) => (
          <Card key={panel.panelId} gradient>
            <div className="flex items-start gap-3">
              <div className="w-3 h-full rounded-full shrink-0 mt-1" style={{ backgroundColor: panel.color, minHeight: 48 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-white">{panel.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{panel.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => openEdit(panel, i)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePanel(i)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="violet">{panel.type}</Badge>
                  <Badge variant="blue">{panel.entries.length} roles</Badge>
                  {panel.maxChoices > 0 && <Badge variant="yellow">Max {panel.maxChoices}</Badge>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Panel Editor Modal */}
      <Modal open={!!editPanel} onClose={closeModal} title={editIdx >= 0 ? 'Edit Panel' : 'New Panel'} size="lg">
        {editPanel && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Panel Title" value={editPanel.title} onChange={v => setEditPanel(p => p && ({ ...p, title: v }))} />
              <Select label="Type" value={editPanel.type} onChange={v => setEditPanel(p => p && ({ ...p, type: v as RRType }))} options={TYPE_OPTIONS} />
            </div>
            <Input label="Description" value={editPanel.description} onChange={v => setEditPanel(p => p && ({ ...p, description: v }))} multiline rows={2} />
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker label="Embed Color" value={editPanel.color} onChange={v => setEditPanel(p => p && ({ ...p, color: v }))} />
              <Select label="Channel" value={editPanel.channelId} onChange={v => setEditPanel(p => p && ({ ...p, channelId: v }))} options={chOptions} placeholder="Select channel" />
            </div>
            <Input label="Max Choices (0 = unlimited)" type="number" value={String(editPanel.maxChoices)} onChange={v => setEditPanel(p => p && ({ ...p, maxChoices: Number(v) }))} />

            <div className="border-t border-white/[0.08] pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-white">Role Entries</p>
                <button onClick={() => setEditPanel(p => p && ({ ...p, entries: [...p.entries, newEntry()] }))} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-all">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="space-y-3">
                {editPanel.entries.map((entry, ei) => (
                  <div key={ei} className="grid grid-cols-12 gap-2 items-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <input value={entry.emoji} onChange={e => setEditPanel(p => p && ({ ...p, entries: p.entries.map((en, idx) => idx === ei ? { ...en, emoji: e.target.value } : en) }))} className="col-span-1 bg-white/[0.06] border border-white/10 text-white rounded-lg p-2 text-center text-sm focus:outline-none" placeholder="😊" />
                    <div className="col-span-4">
                      <Select value={entry.roleId} onChange={v => setEditPanel(p => p && ({ ...p, entries: p.entries.map((en, idx) => idx === ei ? { ...en, roleId: v } : en) }))} options={roleOptions} placeholder="Role" />
                    </div>
                    <input value={entry.label} onChange={e => setEditPanel(p => p && ({ ...p, entries: p.entries.map((en, idx) => idx === ei ? { ...en, label: e.target.value } : en) }))} className="col-span-3 bg-white/[0.06] border border-white/10 text-white rounded-lg px-2 py-2 text-sm focus:outline-none" placeholder="Label" />
                    <div className="col-span-3">
                      <Select value={entry.style} onChange={v => setEditPanel(p => p && ({ ...p, entries: p.entries.map((en, idx) => idx === ei ? { ...en, style: v } : en) }))} options={STYLE_OPTIONS} />
                    </div>
                    <button onClick={() => setEditPanel(p => p && ({ ...p, entries: p.entries.filter((_, idx) => idx !== ei) }))} className="col-span-1 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm">Cancel</button>
              <button onClick={savePanel} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all">Save Panel</button>
            </div>
          </div>
        )}
      </Modal>

      <SaveBar status={status} onSave={save} isDirty={isDirty} onReset={() => { setEnabled(saved.enabled); setPanels(saved.panels); }} />
    </div>
  );
}
