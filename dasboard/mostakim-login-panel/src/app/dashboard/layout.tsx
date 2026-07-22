'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import BottomNav from '@/components/dashboard/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

function buildBreadcrumbs(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];
  if (parts[1] === 'servers') {
    crumbs.push({ label: 'Servers', href: '/dashboard/servers' });
    if (parts[2]) {
      crumbs.push({ label: parts[2].slice(0, 10) + (parts[2].length > 10 ? '…' : '') });
      if (parts[3]) crumbs.push({ label: parts[3].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
    }
  } else if (parts[1]) {
    crumbs.push({ label: parts[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
  }
  return crumbs;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }, [router]);

  const pathParts = pathname.split('/').filter(Boolean);
  const guildId = pathParts[1] === 'servers' && pathParts[2] ? pathParts[2] : undefined;
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <ToastProvider>
      <div className="flex h-dvh overflow-hidden bg-[#070710]">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(c => !c)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          guildId={guildId}
          onLogout={logout}
        />

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar
            onMenuOpen={() => setMobileOpen(true)}
            breadcrumbs={breadcrumbs}
          />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 sm:p-5 lg:p-6 pb-24 lg:pb-8 max-w-7xl mx-auto w-full min-h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />

        {/* Ambient background blobs */}
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
          <div className="blob w-[500px] h-[500px] bg-violet-700/8 top-[-200px] left-[-100px] animate-[blob_14s_infinite_alternate]" />
          <div className="blob w-[350px] h-[350px] bg-blue-600/8 bottom-[-100px] right-[-80px] animate-[blob_18s_infinite_alternate-reverse]" />
          <div className="blob w-[250px] h-[250px] bg-fuchsia-700/6 top-[50%] left-[50%] animate-[blob_22s_infinite_alternate]" />
        </div>
      </div>
    </ToastProvider>
  );
}
