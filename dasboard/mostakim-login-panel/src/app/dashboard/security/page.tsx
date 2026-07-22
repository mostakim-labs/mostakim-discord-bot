'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ChevronLeft, ChevronRight, Search, Download,
  CheckCircle2, XCircle, Key, Lock, LogOut, RefreshCw,
  AlertTriangle, Activity, Filter, Clock, Monitor, Globe,
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import Badge from '@/components/ui/Badge';

type LogEvent = 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'OTP_SENT' | 'OTP_VERIFIED' | 'OTP_FAILED' | 'ACCOUNT_LOCKED' | 'RESEND_OTP' | 'LOGOUT';

interface LogEntry {
  _id: string; event: LogEvent; ip: string; browser: string;
  device: string; userAgent: string; createdAt: string;
}

interface LogsResponse {
  logs: LogEntry[]; total: number; page: number; pages: number;
}

interface Stats {
  totalLogins: number; totalFailed: number; accountLocks: number;
  todayLogins?: number; todayFailed?: number;
}

const EVENT_META: Record<LogEvent, { variant: 'green' | 'red' | 'yellow' | 'blue' | 'gray'; label: string; icon: React.ElementType }> = {
  LOGIN_SUCCESS:  { variant: 'green',  label: 'Login OK',     icon: CheckCircle2 },
  LOGIN_FAILED:   { variant: 'red',    label: 'Login Failed', icon: XCircle },
  OTP_SENT:       { variant: 'blue',   label: 'OTP Sent',     icon: Key },
  OTP_VERIFIED:   { variant: 'green',  label: 'OTP Verified', icon: CheckCircle2 },
  OTP_FAILED:     { variant: 'red',    label: 'OTP Failed',   icon: XCircle },
  ACCOUNT_LOCKED: { variant: 'yellow', label: 'Locked',       icon: Lock },
  RESEND_OTP:     { variant: 'blue',   label: 'OTP Resent',   icon: Key },
  LOGOUT:         { variant: 'gray',   label: 'Logout',       icon: LogOut },
};

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ── Loading skeleton ── */
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
          <div className="w-20 h-6 bg-white/8 rounded-full shrink-0" />
          <div className="w-28 h-4 bg-white/6 rounded font-mono shrink-0" />
          <div className="flex-1 h-4 bg-white/4 rounded hidden sm:block" />
          <div className="w-20 h-4 bg-white/4 rounded hidden md:block" />
          <div className="w-16 h-4 bg-white/4 rounded shrink-0" />
        </div>
      ))}
    </div>
  );
}

/* ── Mobile card for a single log entry ── */
function LogCard({ log }: { log: LogEntry }) {
  const meta = EVENT_META[log.event] ?? { variant: 'gray' as const, label: log.event, icon: Activity };
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            meta.variant === 'green'  ? 'bg-emerald-500/15' :
            meta.variant === 'red'   ? 'bg-red-500/15' :
            meta.variant === 'yellow'? 'bg-yellow-500/15' :
            meta.variant === 'blue'  ? 'bg-blue-500/15' : 'bg-white/8'
          }`}>
            <Icon className={`w-4 h-4 ${
              meta.variant === 'green'  ? 'text-emerald-400' :
              meta.variant === 'red'   ? 'text-red-400' :
              meta.variant === 'yellow'? 'text-yellow-400' :
              meta.variant === 'blue'  ? 'text-blue-400' : 'text-white/40'
            }`} />
          </div>
          <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
        </div>
        <span className="text-xs text-white/30 whitespace-nowrap shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" />{timeAgo(log.createdAt)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-0.5">
          <p className="text-white/30 uppercase tracking-wide text-[10px] font-semibold">IP Address</p>
          <p className="text-white/80 font-mono">{log.ip || '—'}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-white/30 uppercase tracking-wide text-[10px] font-semibold">Device</p>
          <p className="text-white/60 truncate">{log.device || '—'}</p>
        </div>
        {log.browser && (
          <div className="col-span-2 space-y-0.5">
            <p className="text-white/30 uppercase tracking-wide text-[10px] font-semibold">Browser</p>
            <p className="text-white/50 truncate">{log.browser}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SecurityPage() {
  const [data, setData]       = useState<LogsResponse | null>(null);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/dashboard/logs?page=${p}`).then(r => r.json()),
        fetch('/api/dashboard/stats').then(r => r.json()),
      ]);
      if (!logsRes.error) setData(logsRes);
      if (!statsRes.error) setStats(statsRes);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(page); }, [page, fetchData]);

  const refresh = () => { setRefreshing(true); fetchData(page); };

  const filtered = (data?.logs ?? []).filter(log => {
    if (filter && log.event !== filter) return false;
    const q = search.toLowerCase();
    if (q && !log.ip.includes(q) && !(log.browser ?? '').toLowerCase().includes(q) && !(log.device ?? '').toLowerCase().includes(q)) return false;
    return true;
  });

  const exportCSV = () => {
    const csv = ['Event,IP,Browser,Device,Time',
      ...(data?.logs ?? []).map(l => `${l.event},${l.ip},"${l.browser ?? ''}","${l.device ?? ''}",${l.createdAt}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'auth-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start gap-3 sm:gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-violet-600/25 to-blue-600/15 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">Security Logs</h1>
            <p className="text-white/40 text-xs sm:text-sm mt-0.5 leading-relaxed">
              Full audit trail of all authentication events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-xs sm:text-sm disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-xs sm:text-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          label="Total Logins"
          value={stats?.totalLogins ?? '—'}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBg="from-emerald-600/20 to-emerald-600/5"
          sub={stats?.todayLogins != null ? `+${stats.todayLogins} today` : undefined}
          subColor="text-emerald-400/70"
          index={0}
        />
        <StatsCard
          label="Failed Auth"
          value={stats?.totalFailed ?? '—'}
          icon={<XCircle className="w-5 h-5 text-red-400" />}
          iconBg="from-red-600/20 to-red-600/5"
          sub={stats?.todayFailed != null ? `+${stats.todayFailed} today` : undefined}
          subColor="text-red-400/70"
          index={1}
        />
        <StatsCard
          label="Account Locks"
          value={stats?.accountLocks ?? '—'}
          icon={<Lock className="w-5 h-5 text-yellow-400" />}
          iconBg="from-yellow-600/20 to-yellow-600/5"
          index={2}
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by IP, browser, or device…"
            className="w-full bg-white/[0.06] border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-white/30 focus:outline-none focus:border-violet-500/60 focus:bg-violet-500/5 transition-all"
          />
        </div>
        <div className="relative shrink-0">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-white/[0.06] border border-white/10 text-white rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:border-violet-500/60 transition-all cursor-pointer"
          >
            <option value="" className="bg-[#0d0d1a]">All Events</option>
            {Object.entries(EVENT_META).map(([k, v]) => (
              <option key={k} value={k} className="bg-[#0d0d1a]">{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="grad-border">
        <div className="glass rounded-[20px] p-4 sm:p-5">

          {/* Header row */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {loading ? 'Loading events…' : `${data?.total ?? 0} Events`}
              </h3>
              {!loading && filtered.length !== (data?.total ?? 0) && (
                <p className="text-xs text-white/40 mt-0.5">{filtered.length} shown after filter</p>
              )}
            </div>
            {data && data.pages > 1 && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-white/30 mr-1 hidden sm:inline">
                  {data.page}/{data.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages || loading}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {loading ? <TableSkeleton /> : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto -mx-1">
                <table className="w-full min-w-[540px]">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Event', 'IP Address', 'Browser', 'Device', 'Time'].map(h => (
                        <th key={h} className="text-left text-[10px] font-bold text-white/30 uppercase tracking-wider py-2.5 px-3 first:pl-1 last:pr-1 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filtered.map((log, i) => {
                      const meta = EVENT_META[log.event] ?? { variant: 'gray' as const, label: log.event };
                      return (
                        <motion.tr
                          key={log._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-3 px-3 pl-1">
                            <Badge variant={meta.variant} size="sm">{meta.label}</Badge>
                          </td>
                          <td className="py-3 px-3 text-sm text-white/75 font-mono whitespace-nowrap">
                            {log.ip || '—'}
                          </td>
                          <td className="py-3 px-3 text-sm text-white/50 max-w-[180px]">
                            <span className="truncate block" title={log.browser}>{log.browser || '—'}</span>
                          </td>
                          <td className="py-3 px-3 text-sm text-white/40 max-w-[130px]">
                            <span className="truncate block" title={log.device}>{log.device || '—'}</span>
                          </td>
                          <td className="py-3 px-3 pr-1">
                            <span className="text-xs text-white/30 whitespace-nowrap" title={formatDate(log.createdAt)}>
                              {timeAgo(log.createdAt)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <Shield className="w-10 h-10 text-white/10 mx-auto mb-3" />
                          <p className="text-white/30 text-sm font-medium">No events match your filter</p>
                          <p className="text-white/20 text-xs mt-1">Try clearing the search or changing the event filter</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list */}
              <div className="sm:hidden space-y-2">
                <AnimatePresence>
                  {filtered.map(log => <LogCard key={log._id} log={log} />)}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <Shield className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm font-medium">No events found</p>
                  </div>
                )}
              </div>

              {/* Pagination footer */}
              {data && data.pages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-white/[0.06]">
                  <p className="text-xs text-white/30">
                    Page <span className="text-white/60 font-semibold">{data.page}</span> of {data.pages} · {data.total} total
                  </p>
                  <div className="flex gap-1.5">
                    {[...Array(Math.min(data.pages, 7))].map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                            p === page
                              ? 'bg-violet-600/40 border border-violet-500/40 text-white'
                              : 'bg-white/[0.05] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08]'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
