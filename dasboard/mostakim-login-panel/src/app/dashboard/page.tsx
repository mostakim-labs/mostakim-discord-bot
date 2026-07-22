'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Server, Users, Zap, Clock, Cpu, Database, Wifi,
  Activity, HardDrive, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, ExternalLink
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

interface BotStats {
  guilds: number; members: number; commands: number; uptime: number;
  memory: { used: number; heap: number; total: number };
  status: { bot: string; db: string; api: string };
}

interface AuthStats {
  totalLogins: number; todayLogins: number; totalFailed: number;
  todayFailed: number; accountLocks: number;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const QUICK_ACTIONS = [
  { label: 'Manage Servers', href: '/dashboard/servers', icon: Server, color: 'from-violet-600/20 to-violet-600/5' },
  { label: 'View Analytics', href: '/dashboard/analytics', icon: Activity, color: 'from-blue-600/20 to-blue-600/5' },
  { label: 'Security Logs', href: '/dashboard/security', icon: AlertTriangle, color: 'from-red-600/20 to-red-600/5' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Zap, color: 'from-yellow-600/20 to-yellow-600/5' },
];

export default function DashboardHome() {
  const [botStats, setBotStats] = useState<BotStats | null>(null);
  const [authStats, setAuthStats] = useState<AuthStats | null>(null);
  const [logs, setLogs] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    try {
      const [botRes, authRes, logsRes] = await Promise.allSettled([
        fetch('/api/bot/stats').then(r => r.json()),
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/dashboard/logs?page=1').then(r => r.json()),
      ]);
      if (botRes.status === 'fulfilled' && !botRes.value.error) setBotStats(botRes.value);
      if (authRes.status === 'fulfilled' && !authRes.value.error) setAuthStats(authRes.value);
      if (logsRes.status === 'fulfilled' && !logsRes.value.error) setLogs(logsRes.value.logs ?? []);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => { setRefreshing(true); await fetchData(); };

  const statusVariant = (s: string): 'green' | 'red' => s === 'online' ? 'green' : 'red';
  const StatusIcon = ({ s }: { s: string }) =>
    s === 'online' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-white"
          >
            Overview
          </motion.h1>
          <p className="text-white/40 text-sm mt-0.5">
            Last updated {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all text-sm disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Status */}
      <div className="flex flex-wrap gap-2">
        {botStats?.status && Object.entries(botStats.status).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg">
            <StatusIcon s={val} />
            <span className="text-xs font-medium text-white/60 capitalize">{key}</span>
            <Badge variant={statusVariant(val)} size="sm">{val}</Badge>
          </div>
        ))}
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Servers" index={0}
          value={loading ? '—' : (botStats?.guilds ?? 'N/A')}
          icon={<Server className="w-5 h-5 text-violet-400" />}
          sub="Active guilds"
        />
        <StatsCard
          label="Members" index={1}
          value={loading ? '—' : (botStats?.members ?? 'N/A')}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          iconBg="from-blue-600/20 to-blue-600/5"
          sub="Across all servers"
        />
        <StatsCard
          label="Logins" index={2}
          value={loading ? '—' : (authStats?.totalLogins ?? 0)}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          iconBg="from-emerald-600/20 to-emerald-600/5"
          sub={`${authStats?.todayLogins ?? 0} today`}
          subColor="text-emerald-400/60"
        />
        <StatsCard
          label="Uptime" index={3}
          value={loading ? '—' : (botStats ? formatUptime(botStats.uptime) : 'N/A')}
          icon={<Clock className="w-5 h-5 text-yellow-400" />}
          iconBg="from-yellow-600/20 to-yellow-600/5"
          sub="Dashboard uptime"
        />
      </div>

      {/* System resources */}
      {botStats && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grad-border">
            <div className="glass rounded-[20px] p-5">
              <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-violet-400" />
                System Resources
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white/40 flex items-center gap-1.5">
                      <HardDrive className="w-3 h-3" />RAM Used
                    </span>
                    <span className="text-xs font-bold text-white">{botStats.memory.used} MB</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-blue-600 rounded-full transition-all"
                      style={{ width: `${Math.min((botStats.memory.used / 512) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white/40 flex items-center gap-1.5">
                      <Cpu className="w-3 h-3" />Heap Used
                    </span>
                    <span className="text-xs font-bold text-white">{botStats.memory.heap} MB</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${Math.min((botStats.memory.heap / botStats.memory.total) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-white/40 flex items-center gap-1.5">
                      <Database className="w-3 h-3" />Auth Failures
                    </span>
                    <span className="text-xs font-bold text-red-400">{authStats?.totalFailed ?? 0}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all"
                      style={{ width: `${Math.min(((authStats?.totalFailed ?? 0) / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="grad-border h-full">
            <div className="glass rounded-[20px] p-5 h-full">
              <h3 className="text-base font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map(action => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br ${action.color} border border-white/[0.08] hover:border-violet-500/30 transition-all group`}
                    >
                      <Icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                      <span className="text-xs font-medium text-white/60 group-hover:text-white text-center transition-colors">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="grad-border">
            <div className="glass rounded-[20px] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Recent Activity</h3>
                <Link href="/dashboard/security" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <ActivityFeed logs={(logs as Parameters<typeof ActivityFeed>[0]['logs']).slice(0, 8)} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
