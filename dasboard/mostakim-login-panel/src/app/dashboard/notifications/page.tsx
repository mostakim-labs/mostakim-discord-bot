'use client';
import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Server, Users, ShieldAlert, AlertTriangle, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

type NotifType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string; type: NotifType; title: string; body: string;
  time: string; read: boolean; icon?: string;
}

const TYPE_ICONS = {
  info: Info, success: Zap, warning: AlertTriangle, error: ShieldAlert,
};

const TYPE_COLORS = {
  info:    'text-blue-400 bg-blue-500/15',
  success: 'text-emerald-400 bg-emerald-500/15',
  warning: 'text-yellow-400 bg-yellow-500/15',
  error:   'text-red-400 bg-red-500/15',
};

const BADGE_VARIANTS: Record<NotifType, 'blue' | 'green' | 'yellow' | 'red'> = {
  info: 'blue', success: 'green', warning: 'yellow', error: 'red',
};

// Demo notifications — in production these would come from an API / socket
const DEMO_NOTIFS: Notification[] = [
  { id: '1', type: 'success', title: 'Bot Connected', body: 'Bot is online and connected to Discord gateway.', time: new Date(Date.now() - 120000).toISOString(), read: false },
  { id: '2', type: 'info', title: 'New Server Joined', body: 'The bot was added to a new server.', time: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: '3', type: 'warning', title: 'High Memory Usage', body: 'Dashboard process memory is above 200MB.', time: new Date(Date.now() - 7200000).toISOString(), read: true },
  { id: '4', type: 'error', title: 'Login Attempt Failed', body: '5 consecutive failed login attempts detected from 192.168.1.100.', time: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: '5', type: 'info', title: 'Configuration Updated', body: 'Welcome system settings were updated for Server Alpha.', time: new Date(Date.now() - 172800000).toISOString(), read: true },
];

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(DEMO_NOTIFS);
  const [filter, setFilter] = useState<NotifType | 'all'>('all');

  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(n => n.map(notif => ({ ...notif, read: true })));
  const markRead = (id: string) => setNotifs(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
  const dismiss = (id: string) => setNotifs(n => n.filter(notif => notif.id !== id));

  const filtered = notifs.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Notifications</h1>
            <p className="text-white/40 text-sm mt-0.5">Real-time alerts and system events</p>
          </div>
          {unread > 0 && <Badge variant="violet" dot>{unread} unread</Badge>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 hover:text-white transition-all text-sm">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'info', 'success', 'warning', 'error'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-violet-600/30 border border-violet-500/30 text-violet-300' : 'bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/70'}`}
          >
            {f === 'all' ? `All (${notifs.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notif list */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <Card gradient>
              <div className="py-16 text-center">
                <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No notifications</p>
              </div>
            </Card>
          )}
          {filtered.map(notif => {
            const Icon = TYPE_ICONS[notif.type];
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                className={`grad-border ${!notif.read ? 'ring-1 ring-violet-500/20' : ''}`}
              >
                <div
                  className="glass rounded-[20px] p-4 flex items-start gap-4 cursor-pointer"
                  onClick={() => markRead(notif.id)}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${TYPE_COLORS[notif.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className={`text-sm font-bold ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</p>
                      <Badge variant={BADGE_VARIANTS[notif.type]} size="sm">{notif.type}</Badge>
                      {!notif.read && <Badge variant="violet" size="sm" dot>New</Badge>}
                    </div>
                    <p className="text-sm text-white/40">{notif.body}</p>
                    <p className="text-xs text-white/25 mt-1">{timeAgo(notif.time)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    className="shrink-0 text-white/20 hover:text-white/60 text-lg leading-none transition-colors"
                  >×</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
