'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Server, SortAsc, RefreshCw } from 'lucide-react';
import GuildCard from '@/components/dashboard/GuildCard';

interface Guild {
  id: string; name: string; icon: string | null;
  approximate_member_count?: number; approximate_presence_count?: number;
}

export default function ServersPage() {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'members'>('members');
  const [refreshing, setRefreshing] = useState(false);

  const fetchGuilds = async () => {
    try {
      const res = await fetch('/api/bot/guilds');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGuilds(data.guilds);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load servers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchGuilds(); }, []);

  const filtered = useMemo(() => {
    return guilds
      .filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name);
        return (b.approximate_member_count ?? 0) - (a.approximate_member_count ?? 0);
      });
  }, [guilds, search, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-white">Servers</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {loading ? 'Loading…' : `${guilds.length} server${guilds.length !== 1 ? 's' : ''} · ${filtered.length} shown`}
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchGuilds(); }}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-sm disabled:opacity-40 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search servers…"
            className="w-full bg-white/[0.06] border border-white/10 text-white rounded-xl pl-10 pr-4 py-3 text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/70 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSort(s => s === 'name' ? 'members' : 'name')}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 hover:text-white transition-all text-sm"
          >
            <SortAsc className="w-4 h-4" />
            {sort === 'name' ? 'By Name' : 'By Members'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error} — Make sure the bot TOKEN is configured in secrets.
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grad-border">
              <div className="glass rounded-[20px] p-5 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guild grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((guild, i) => (
            <GuildCard
              key={guild.id}
              id={guild.id}
              name={guild.name}
              icon={guild.icon}
              memberCount={guild.approximate_member_count}
              index={i}
            />
          ))}
          {filtered.length === 0 && !error && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/30">
              <Server className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-lg font-semibold">No servers found</p>
              <p className="text-sm mt-1">{search ? 'Try a different search term' : 'Add the bot to a server first'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
