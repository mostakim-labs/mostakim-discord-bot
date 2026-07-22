'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard, Server, BarChart3, Bell, Shield,
  LogOut, ChevronLeft, ChevronRight, Bot, X,
  UserCheck, MessageSquare, Volume2, Hash, Star,
  Gift, ListChecks, Megaphone, Settings2, ShieldCheck, Smile,
  Sliders, BotMessageSquare
} from 'lucide-react';

const TOP_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/servers', label: 'Servers', icon: Server },
  { href: '/dashboard/bot-control', label: 'Bot Control', icon: Sliders },
  { href: '/dashboard/bots', label: 'Bot Manager', icon: BotMessageSquare },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/security', label: 'Security', icon: Shield },
];

export const SERVER_NAV = [
  { key: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { key: 'welcome',        label: 'Welcome',         icon: MessageSquare },
  { key: 'leave',          label: 'Leave',           icon: LogOut },
  { key: 'moderation',     label: 'Moderation',      icon: ShieldCheck },
  { key: 'logging',        label: 'Logging',         icon: ListChecks },
  { key: 'autorole',       label: 'Auto Role',       icon: UserCheck },
  { key: 'tickets',        label: 'Tickets',         icon: Hash },
  { key: 'reaction-roles', label: 'Reaction Roles',  icon: Smile },
  { key: 'verification',   label: 'Verification',    icon: ShieldCheck },
  { key: 'voice',          label: 'Voice Manager',   icon: Volume2 },
  { key: 'giveaways',      label: 'Giveaways',       icon: Gift },
  { key: 'embed-builder',  label: 'Embed Builder',   icon: Star },
  { key: 'announcements',  label: 'Announcements',   icon: Megaphone },
  { key: 'roles',          label: 'Role Manager',    icon: Settings2 },
  { key: 'channels',       label: 'Channel Manager', icon: Hash },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  guildId?: string;
  guildName?: string;
  guildIcon?: string | null;
  onLogout: () => void;
}

export default function Sidebar({
  collapsed, onToggle, mobileOpen, onMobileClose,
  guildId, guildName, guildIcon, onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-violet-500/40 shrink-0">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
              <p className="text-sm font-extrabold grad-text whitespace-nowrap">MOSTAKIM BOT</p>
              <p className="text-[10px] text-white/30 whitespace-nowrap">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={onMobileClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Global nav */}
        {TOP_NAV.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                active
                  ? 'bg-gradient-to-r from-violet-600/25 to-blue-600/15 text-white border border-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {active && <motion.div layoutId="nav-pill" className="absolute inset-0 rounded-xl" />}
              <Icon className={`w-4.5 h-4.5 shrink-0 ${active ? 'text-violet-400' : 'group-hover:text-white/80'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* Server-specific nav */}
        {guildId && (
          <>
            <div className={`pt-4 pb-1.5 ${collapsed ? 'text-center' : 'px-3'}`}>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {guildIcon ? (
                      <div className="flex items-center gap-2 mb-2">
                        <img src={guildIcon} alt={guildName} className="w-5 h-5 rounded-full" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider truncate">{guildName}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Server Settings</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {collapsed && <div className="w-6 h-px bg-white/10 mx-auto" />}
            </div>
            {SERVER_NAV.map(item => {
              const Icon = item.icon;
              const href = item.key === 'overview'
                ? `/dashboard/servers/${guildId}`
                : `/dashboard/servers/${guildId}/${item.key}`;
              const active = item.key === 'overview'
                ? pathname === `/dashboard/servers/${guildId}`
                : pathname.startsWith(href);
              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                    active
                      ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border border-violet-500/15'
                      : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-400' : ''}`} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] font-medium whitespace-nowrap overflow-hidden">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">Logout</motion.span>}
          </AnimatePresence>
        </button>
        <button
          onClick={onToggle}
          className={`hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <motion.aside
        className="fixed top-0 left-0 h-full z-50 lg:hidden w-72 bg-[#0a0a18] border-r border-white/[0.06]"
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col h-full bg-[#0a0a18] border-r border-white/[0.06] overflow-hidden"
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
