'use client';
import { useState, useEffect, use } from 'react';
import { Hash, Volume2, RefreshCw, Megaphone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface Channel {
  id: string; type: number; name: string; position?: number;
  parent_id?: string | null; topic?: string | null;
}

const TYPE_ICONS: Record<number, React.ElementType> = {
  0: Hash, 2: Volume2, 4: Hash, 5: Megaphone, 13: Megaphone, 15: Hash,
};

const TYPE_LABELS: Record<number, string> = {
  0: 'Text', 2: 'Voice', 4: 'Category', 5: 'Announcement',
  10: 'Thread', 11: 'Thread', 12: 'Thread', 13: 'Stage', 14: 'Directory', 15: 'Forum',
};

export default function ChannelsPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = use(params);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchChannels = async () => {
    setLoading(true);
    const res = await fetch(`/api/bot/guilds/${guildId}/channels`);
    const d = await res.json();
    setChannels((d.channels ?? []).sort((a: Channel, b: Channel) => {
      if (a.type === 4 && b.type !== 4) return -1;
      if (a.type !== 4 && b.type === 4) return 1;
      return (a.position ?? 0) - (b.position ?? 0);
    }));
    setLoading(false);
  };

  useEffect(() => { fetchChannels(); }, [guildId]);

  const categories = channels.filter(c => c.type === 4);
  const filtered = channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const stats = { text: channels.filter(c => c.type === 0).length, voice: channels.filter(c => c.type === 2).length, category: categories.length };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Hash className="w-6 h-6 text-sky-400" />}
        iconBg="from-sky-600/20 to-sky-600/5"
        title="Channel Manager"
        description="View all server channels"
        actions={
          <button onClick={fetchChannels} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white transition-all text-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Text', count: stats.text, color: 'text-blue-400' },
          { label: 'Voice', count: stats.voice, color: 'text-green-400' },
          { label: 'Categories', count: stats.category, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="grad-border">
            <div className="glass rounded-[20px] p-4 text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search channels…"
        className="w-full bg-white/[0.06] border border-white/10 text-white rounded-xl px-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/70 transition-all"
      />

      <Card gradient title={`${filtered.length} channels`}>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {loading && [...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 animate-pulse">
              <div className="w-4 h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 rounded flex-1" />
            </div>
          ))}
          {filtered.map(ch => {
            const Icon = TYPE_ICONS[ch.type] ?? Hash;
            const isCategory = ch.type === 4;
            const label = TYPE_LABELS[ch.type] ?? `Type ${ch.type}`;
            return (
              <div
                key={ch.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isCategory ? 'mt-4 first:mt-0' : 'pl-6'}`}
              >
                {isCategory ? (
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wider flex-1">{ch.name}</p>
                ) : (
                  <>
                    <Icon className="w-4 h-4 text-white/40 shrink-0" />
                    <span className="text-sm text-white/70 flex-1 truncate">{ch.name}</span>
                    {ch.topic && <span className="text-xs text-white/30 truncate max-w-[200px] hidden sm:block">{ch.topic}</span>}
                    <Badge variant="gray" size="sm">{label}</Badge>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
