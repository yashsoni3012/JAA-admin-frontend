'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileSidebar from '@/components/admin/MobileSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LogoutModal from '@/components/common/LogoutModal';
import { SIDEBAR_NAV } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

// Works out the header title from the current URL.
function getPageTitle(pathname) {
  if (pathname === ROUTES.MEMBERS || pathname.startsWith(`${ROUTES.MEMBERS}/`)) {
    return 'Members Approval';
  }
  if (pathname === ROUTES.PROFILE) return 'Profile';
  if (pathname === ROUTES.SETTINGS) return 'Settings';
  if (pathname === ROUTES.COMPLAINTS || pathname.startsWith(`${ROUTES.COMPLAINTS}`)) {
    return 'Complaints';
  }
  const match = SIDEBAR_NAV.find((item) => pathname.startsWith(item.href));
  return match ? match.label : 'Admin';
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Restore collapsed state preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jaa_sidebar_collapsed');
      if (saved !== null) {
        setCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('jaa_sidebar_collapsed', String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EEF1FF]">
      {/* Desktop sidebar with smooth width transition */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 lg:block bg-[#EEF1FF] transition-[width] duration-300 ease-in-out z-20 overflow-hidden',
          collapsed ? 'w-[84px]' : 'w-[260px]'
        )}
      >
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={toggleSidebar}
          onLogoutClick={() => setIsLogoutOpen(true)}
        />
      </aside>

      <MobileSidebar
        open={mobileOpen}
        onClose={closeMobile}
        onLogoutClick={() => setIsLogoutOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-[#EEF1FF] transition-all duration-300">
        {/* Topbar */}
        <AdminHeader
          title={getPageTitle(pathname)}
          onMenuClick={toggleSidebar}
          sidebarCollapsed={collapsed}
          onLogoutClick={() => setIsLogoutOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pb-8 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal matching the design */}
      <LogoutModal
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
}
