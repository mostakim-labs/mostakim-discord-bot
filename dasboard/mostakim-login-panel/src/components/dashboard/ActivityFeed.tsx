'use client';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, LogIn, LogOut, Key, Lock
} from 'lucide-react';

type LogEvent =
  | 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'OTP_SENT' | 'OTP_VERIFIED'
  | 'OTP_FAILED' | 'ACCOUNT_LOCKED' | 'RESEND_OTP' | 'LOGOUT';

interface LogEntry {
  _id: string;
  event: LogEvent;
  ip: string;
  browser: string;
  device: string;
  createdAt: string;
}

const EVENT_CONFIG: Record<LogEvent, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  LOGIN_SUCCESS:  { label: 'Login success',  icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  LOGIN_FAILED:   { label: 'Login failed',   icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/15' },
  OTP_SENT:       { label: 'OTP sent',       icon: Key,           color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  OTP_VERIFIED:   { label: 'OTP verified',   icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  OTP_FAILED:     { label: 'OTP failed',     icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/15' },
  ACCOUNT_LOCKED: { label: 'Account locked', icon: Lock,          color: 'text-yellow-400',  bg: 'bg-yellow-500/15' },
  RESEND_OTP:     { label: 'OTP resent',     icon: Key,           color: 'text-blue-400',    bg: 'bg-blue-500/15' },
  LOGOUT:         { label: 'Logged out',     icon: LogOut,        color: 'text-white/50',    bg: 'bg-white/10' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ActivityFeed({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="space-y-2">
      {logs.length === 0 && (
        <p className="text-center text-white/30 text-sm py-8">No activity yet</p>
      )}
      {logs.map((log, i) => {
        const cfg = EVENT_CONFIG[log.event] ?? EVENT_CONFIG.LOGOUT;
        const Icon = cfg.icon;
        return (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.bg} shrink-0`}>
              <Icon className={`w-4 h-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{cfg.label}</p>
              <p className="text-xs text-white/30 truncate">{log.ip} · {log.browser || 'Unknown browser'}</p>
            </div>
            <span className="text-xs text-white/25 shrink-0">{timeAgo(log.createdAt)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
