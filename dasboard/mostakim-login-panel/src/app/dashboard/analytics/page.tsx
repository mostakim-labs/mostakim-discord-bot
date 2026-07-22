'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, LogIn, XCircle, Lock, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart, Legend
} from 'recharts';
import StatsCard from '@/components/dashboard/StatsCard';
import Card from '@/components/ui/Card';

interface AuthStats {
  totalLogins: number; todayLogins: number; totalFailed: number;
  todayFailed: number; accountLocks: number;
  weeklyActivity: { _id: string; count: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs">
      <p className="text-white/60 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.name === 'logins' ? '#a78bfa' : '#f87171' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AuthStats | null>(null);
  const [logs, setLogs] = useState<{ event: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/dashboard/logs?page=1').then(r => r.json()),
      ]);
      if (!statsRes.error) setStats(statsRes);
      if (!logsRes.error) setLogs(logsRes.logs ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build chart data from weekly activity + mock additional data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const entry = stats?.weeklyActivity.find(w => w._id === key);
    return {
      date: d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }),
      logins: entry?.count ?? 0,
      failures: logs.filter(l => {
        const logDate = new Date(l.createdAt).toISOString().slice(0, 10);
        return logDate === key && (l.event === 'LOGIN_FAILED' || l.event === 'OTP_FAILED');
      }).length,
    };
  });

  // Events breakdown
  const eventCounts = logs.reduce((acc, log) => {
    acc[log.event] = (acc[log.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventData = Object.entries(eventCounts)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-0.5">Auth events, login activity, and system stats</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white transition-all text-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Logins" value={loading ? '—' : (stats?.totalLogins ?? 0)} icon={<LogIn className="w-5 h-5 text-violet-400" />} index={0} sub={`${stats?.todayLogins ?? 0} today`} />
        <StatsCard label="Failed Attempts" value={loading ? '—' : (stats?.totalFailed ?? 0)} icon={<XCircle className="w-5 h-5 text-red-400" />} iconBg="from-red-600/20 to-red-600/5" index={1} sub={`${stats?.todayFailed ?? 0} today`} subColor="text-red-400/60" />
        <StatsCard label="Account Locks" value={loading ? '—' : (stats?.accountLocks ?? 0)} icon={<Lock className="w-5 h-5 text-yellow-400" />} iconBg="from-yellow-600/20 to-yellow-600/5" index={2} sub="Total locked events" />
        <StatsCard label="Success Rate" value={loading ? '—' : stats ? `${Math.round(((stats.totalLogins) / Math.max(stats.totalLogins + stats.totalFailed, 1)) * 100)}%` : '—'} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} iconBg="from-emerald-600/20 to-emerald-600/5" index={3} sub="Login success rate" />
      </div>

      {/* Weekly chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card gradient title="7-Day Login Activity" description="Successful logins vs failures">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <Area type="monotone" dataKey="logins" stroke="#7c3aed" fill="url(#loginGrad)" strokeWidth={2} name="logins" />
                <Area type="monotone" dataKey="failures" stroke="#ef4444" fill="url(#failGrad)" strokeWidth={2} name="failures" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Event breakdown */}
      {eventData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card gradient title="Event Breakdown" description="Distribution of auth events">
            <div className="h-52 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#loginGrad)" radius={[0, 6, 6, 0]}>
                    {eventData.map((_, i) => (
                      <rect key={i} fill={`hsl(${260 + i * 15}, 70%, 60%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
