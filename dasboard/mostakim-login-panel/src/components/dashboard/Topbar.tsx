'use client';
import { useState } from 'react';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem { label: string; href?: string }

interface TopbarProps {
  onMenuOpen: () => void;
  breadcrumbs?: BreadcrumbItem[];
  notifCount?: number;
}

export default function Topbar({ onMenuOpen, breadcrumbs = [], notifCount = 0 }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 bg-[#0a0a18]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center gap-3 px-4 shrink-0 sticky top-0 z-30">
      {/* Menu button (mobile) */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />}
            {crumb.href ? (
              <Link href={crumb.href} className="text-sm text-white/40 hover:text-white/70 transition-colors truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-white truncate">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link href="/dashboard/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/60 hover:text-white transition-all">
          <Bell className="w-4 h-4" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
