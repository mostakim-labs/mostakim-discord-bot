'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Plus, Trash2, RefreshCw, AlertCircle, CheckCircle2,
  Loader2, Eye, EyeOff, ToggleLeft, ToggleRight, X, ExternalLink
} from 'lucide-react';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

interface ManagedBot {
  _id: string;
  clientId: string;
  name: string;
  avatar: string | null;
  discriminator: string;
  isActive: boolean;
  addedAt: string;
}

function avatarUrl(clientId: string, avatar: string | null): string {
  if (!avatar) return `https://cdn.discordapp.com/embed/avatars/0.png`;
  const ext = avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${clientId}/${avatar}.${ext}?size=128`;
}

export default function BotManagerPage() {
  const [bots, setBots] = useState<ManagedBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [token, setToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBots = () => {
    setLoading(true);
    fetch('/api/bot/bots')
      .then(r => r.json())
      .then(d => setBots(d.bots ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBots(); }, []);

  const addBot = async () => {
    if (!token.trim() || !clientId.trim()) return;
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/bot/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), clientId: clientId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to add bot');
      setBots(prev => [...prev, data.bot]);
      setToken('');
      setClientId('');
      setShowAdd(false);
    } catch (e: unknown) {
      setAddError(e instanceof Error ? e.message : 'Failed to add bot');
    } finally {
      setAdding(false);
    }
  };

  const toggleBot = async (bot: ManagedBot) => {
    const res = await fetch(`/api/bot/bots/${bot._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !bot.isActive }),
    });
    if (res.ok) {
      const data = await res.json();
      setBots(prev => prev.map(b => b._id === bot._id ? { ...b, isActive: data.bot.isActive } : b));
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm('Remove this bot from the manager? It will stop being monitored.')) return;
    setDeleting(id);
    await fetch(`/api/bot/bots/${id}`, { method: 'DELETE' });
    setBots(prev => prev.filter(b => b._id !== id));
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Bot className="w-6 h-6 text-violet-400" />}
        title="Bot Manager"
        description="Add and manage multiple Discord bots from one dashboard"
        badge={<Badge variant="violet" dot>{bots.length} bot{bots.length !== 1 ? 's' : ''}</Badge>}
        actions={
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Bot
          </button>
        }
      />

      {/* ── Info banner ── */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm space-y-1">
        <p className="font-semibold">ℹ️ How it works</p>
        <p className="text-blue-300/70 text-xs">Add bot tokens here to manage multiple bots. The main Discord Bot process reads from this list on startup and connects all active bots. After adding, <strong>restart the Discord Bot workflow</strong> to activate new bots.</p>
      </div>

      {/* ── Add Bot Form ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card gradient title="Add New Bot" description="Paste the bot token and Client ID">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="Bot Token"
                    value={token}
                    onChange={setToken}
                    placeholder="MTxxxxxxxxxxxxxxxxxxxxxxxx.Gxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(v => !v)}
                    className="absolute right-3 top-8 text-white/30 hover:text-white/60"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {!showToken && token && (
                    <div className="absolute inset-x-0 bottom-0 pointer-events-none">
                      <div className="absolute right-3 top-[-28px] font-mono text-sm tracking-widest text-white/50">{'•'.repeat(Math.min(token.length, 40))}</div>
                    </div>
                  )}
                </div>
                <Input
                  label="Client ID (Application ID)"
                  value={clientId}
                  onChange={setClientId}
                  placeholder="123456789012345678"
                />
                {addError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {addError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={addBot}
                    disabled={adding || !token.trim() || !clientId.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-40 transition-all text-sm"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {adding ? 'Verifying & Adding…' : 'Add Bot'}
                  </button>
                  <button
                    onClick={() => { setShowAdd(false); setAddError(''); setToken(''); setClientId(''); }}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 hover:text-white transition-all text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bot List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : bots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/30">
          <Bot className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-semibold">No bots added yet</p>
          <p className="text-sm mt-1">Click "Add Bot" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {bots.map((bot, i) => (
            <motion.div
              key={bot._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grad-border"
            >
              <div className="glass rounded-[20px] p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl(bot.clientId, bot.avatar)}
                      alt={bot.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a18] ${bot.isActive ? 'bg-green-500' : 'bg-gray-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{bot.name}</p>
                    <p className="text-xs text-white/40 font-mono truncate">{bot.clientId}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5865f2] text-white">BOT</span>
                      <Badge variant={bot.isActive ? 'green' : 'gray'} size="sm">
                        {bot.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-white/30">
                  Added {new Date(bot.addedAt).toLocaleDateString()}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                  <button
                    onClick={() => toggleBot(bot)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      bot.isActive
                        ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'
                    }`}
                  >
                    {bot.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    {bot.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteBot(bot._id)}
                    disabled={deleting === bot._id}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                  >
                    {deleting === bot._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {bots.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs">
          ⚡ After adding or deactivating bots, restart the <strong>Discord Bot</strong> workflow to apply changes.
        </div>
      )}
    </div>
  );
}
