'use client';
import { useState, use, useEffect } from 'react';
import { Star, Plus, Trash2, Send } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ColorPicker from '@/components/ui/ColorPicker';
import Toggle from '@/components/ui/Toggle';
import EmbedPreview from '@/components/dashboard/EmbedPreview';
import Select from '@/components/ui/Select';
import Tabs from '@/components/ui/Tabs';

interface EmbedField { name: string; value: string; inline: boolean }
interface Button { label: string; url: string; emoji: string }
interface EmbedState {
  color: string; title: string; description: string; footer: string;
  author: string; thumbnail: boolean; bannerUrl: string;
  timestamp: boolean; fields: EmbedField[]; buttons: Button[];
  useEmbed: boolean; plainText: string;
}

const INITIAL: EmbedState = {
  color: '#7c3aed', title: '', description: '', footer: '',
  author: '', thumbnail: false, bannerUrl: '', timestamp: false,
  fields: [], buttons: [], useEmbed: true, plainText: '',
};

const TABS = [
  { id: 'content', label: 'Content' },
  { id: 'media', label: 'Media & Style' },
  { id: 'fields', label: 'Fields' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'preview', label: 'Preview' },
];

export default function EmbedBuilderPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [embed, setEmbed] = useState<EmbedState>(INITIAL);
  const [activeTab, setActiveTab] = useState('content');
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [sendChannel, setSendChannel] = useState('');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  useEffect(() => {
    fetch(`/api/bot/guilds/${guildId}/channels`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChannels(data.filter((c: { type: number }) => c.type === 0));
        }
      })
      .catch(() => {});
  }, [guildId]);

  const set = <K extends keyof EmbedState>(key: K, val: EmbedState[K]) =>
    setEmbed(e => ({ ...e, [key]: val }));

  const addField = () => set('fields', [...embed.fields, { name: 'Field Name', value: 'Field value', inline: false }]);
  const removeField = (i: number) => set('fields', embed.fields.filter((_, idx) => idx !== i));
  const updateField = (i: number, f: Partial<EmbedField>) =>
    set('fields', embed.fields.map((field, idx) => idx === i ? { ...field, ...f } : field));

  const addButton = () => set('buttons', [...embed.buttons, { label: 'Click Me', url: '', emoji: '' }]);
  const removeButton = (i: number) => set('buttons', embed.buttons.filter((_, idx) => idx !== i));
  const updateButton = (i: number, f: Partial<Button>) =>
    set('buttons', embed.buttons.map((btn, idx) => idx === i ? { ...btn, ...f } : btn));

  const handleSend = async () => {
    if (!sendChannel) return;
    setSending(true);
    // In production, this would call a bot action endpoint
    setTimeout(() => {
      setSending(false);
      setSendStatus('sent');
      setTimeout(() => setSendStatus('idle'), 3000);
    }, 1000);
  };

  const exportJSON = () => {
    const data = JSON.stringify({ embeds: [{ color: parseInt(embed.color.slice(1), 16), title: embed.title, description: embed.description, footer: embed.footer ? { text: embed.footer } : undefined, author: embed.author ? { name: embed.author } : undefined, timestamp: embed.timestamp ? new Date().toISOString() : undefined, fields: embed.fields, image: embed.bannerUrl ? { url: embed.bannerUrl } : undefined }] }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'embed.json'; a.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Star className="w-6 h-6 text-amber-400" />}
        iconBg="from-amber-600/20 to-amber-600/5"
        title="Embed Builder"
        description="Create rich Discord embeds with a live preview"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={exportJSON} className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/70 hover:text-white text-sm transition-all">
              Export JSON
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} className="flex-1" />
          </div>

          {activeTab === 'content' && (
            <Card gradient title="Content">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Use Embed</p>
                    <p className="text-xs text-white/40">Toggle between embed and plain text</p>
                  </div>
                  <Toggle enabled={embed.useEmbed} onChange={v => set('useEmbed', v)} size="sm" />
                </div>
                {embed.useEmbed ? (
                  <>
                    <Input label="Author" value={embed.author} onChange={v => set('author', v)} placeholder="Author name" />
                    <Input label="Title" value={embed.title} onChange={v => set('title', v)} placeholder="Embed title" maxLength={256} />
                    <Input label="Description" value={embed.description} onChange={v => set('description', v)} multiline rows={5} placeholder="Embed description…" maxLength={4096} />
                    <Input label="Footer" value={embed.footer} onChange={v => set('footer', v)} placeholder="Footer text" maxLength={2048} />
                    <div className="flex items-center justify-between py-2">
                      <p className="text-sm text-white/70">Include Timestamp</p>
                      <Toggle enabled={embed.timestamp} onChange={v => set('timestamp', v)} size="sm" />
                    </div>
                  </>
                ) : (
                  <Input label="Plain Text Message" value={embed.plainText} onChange={v => set('plainText', v)} multiline rows={5} placeholder="Your message here…" />
                )}
              </div>
            </Card>
          )}

          {activeTab === 'media' && (
            <Card gradient title="Media & Style">
              <div className="space-y-4">
                <ColorPicker label="Embed Color" value={embed.color} onChange={v => set('color', v)} />
                <Input label="Banner / Image URL" value={embed.bannerUrl} onChange={v => set('bannerUrl', v)} placeholder="https://..." />
                <div className="flex items-center justify-between py-2 border-t border-white/[0.06]">
                  <div>
                    <p className="text-sm font-medium text-white/80">Thumbnail (User Avatar)</p>
                    <p className="text-xs text-white/40">Shows thumbnail in top-right corner</p>
                  </div>
                  <Toggle enabled={embed.thumbnail} onChange={v => set('thumbnail', v)} size="sm" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'fields' && (
            <Card gradient title="Fields" actions={
              <button onClick={addField} disabled={embed.fields.length >= 25} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-all disabled:opacity-40">
                <Plus className="w-3 h-3" /> Add
              </button>
            }>
              <div className="space-y-3">
                {embed.fields.length === 0 && <p className="text-xs text-white/30 py-4 text-center">No fields yet. Add up to 25.</p>}
                {embed.fields.map((field, i) => (
                  <div key={i} className="space-y-2 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <input value={field.name} onChange={e => updateField(i, { name: e.target.value })} placeholder="Field name" className="flex-1 bg-white/[0.06] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none" />
                      <button onClick={() => removeField(i)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea value={field.value} onChange={e => updateField(i, { value: e.target.value })} placeholder="Field value" rows={2} className="w-full bg-white/[0.06] border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                    <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                      <input type="checkbox" checked={field.inline} onChange={e => updateField(i, { inline: e.target.checked })} className="accent-violet-500" />
                      Inline
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'buttons' && (
            <Card gradient title="Buttons" actions={
              <button onClick={addButton} disabled={embed.buttons.length >= 5} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-xs font-medium hover:bg-violet-600/30 transition-all disabled:opacity-40">
                <Plus className="w-3 h-3" /> Add
              </button>
            }>
              <div className="space-y-3">
                {embed.buttons.length === 0 && <p className="text-xs text-white/30 py-4 text-center">No buttons yet. Add up to 5.</p>}
                {embed.buttons.map((btn, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={btn.emoji} onChange={e => updateButton(i, { emoji: e.target.value })} placeholder="😊" className="w-10 bg-white/[0.06] border border-white/10 text-white rounded-lg p-2.5 text-sm text-center focus:outline-none" />
                    <input value={btn.label} onChange={e => updateButton(i, { label: e.target.value })} placeholder="Button label" className="flex-1 bg-white/[0.06] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    <input value={btn.url} onChange={e => updateButton(i, { url: e.target.value })} placeholder="https://..." className="flex-1 bg-white/[0.06] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none" />
                    <button onClick={() => removeButton(i)} className="w-8 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Send panel */}
          <Card gradient title="Send to Channel">
            <div className="flex items-center gap-3">
              <Select
                value={sendChannel}
                onChange={setSendChannel}
                options={channels.map(c => ({ value: c.id, label: `#${c.name}` }))}
                placeholder="Select channel"
                className="flex-1"
              />
              <button
                onClick={handleSend}
                disabled={!sendChannel || sending}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
              >
                <Send className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
                {sending ? 'Sending…' : sendStatus === 'sent' ? 'Sent! ✓' : 'Send'}
              </button>
            </div>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card gradient title="Live Preview" description="Updates in real-time as you type">
            <EmbedPreview
              color={embed.color}
              title={embed.title}
              description={embed.description}
              footer={embed.footer}
              authorName={embed.author}
              thumbnail={embed.thumbnail}
              bannerUrl={embed.bannerUrl}
              fields={embed.fields}
              buttons={embed.buttons}
              useEmbed={embed.useEmbed}
              plainMessage={embed.plainText}
              timestamp={embed.timestamp}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
