'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Menu, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import Avatar from '@/components/common/Avatar';
import { cn } from '@/lib/utils';

export default function AdminHeader({ title, onMenuClick, sidebarCollapsed = false }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'flash_toast',
        JSON.stringify({
          message: 'Logged out successfully!',
          type: 'success',
        })
      );
    }
    showToast('Logging out...', 'info');
    await logout();
    router.replace(ROUTES.LOGIN);
  };


  return (
    <header className="flex items-center justify-between gap-4 bg-[#EEF1FF] px-6 py-6 md:px-8 md:py-7">
      {/* Left side: Menu Icon + Page Title */}
      <div className="flex min-w-0 items-center gap-3.5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex items-center justify-center rounded-xl p-2 text-[#3F4BC4] hover:bg-white/80 active:scale-95 transition-all shadow-xs cursor-pointer"
        >
          <Menu className={cn("h-5 w-5 text-[#3F4BC4] stroke-[2.2] transition-transform duration-300 ease-in-out", sidebarCollapsed && "rotate-90")} />
        </button>
        <h1 className="truncate text-xl md:text-2xl font-bold text-[#1B1F3B] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right side: Profile card pill matching reference design */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex items-center gap-3 rounded-full bg-white/70 hover:bg-white border border-white/80 py-1.5 pl-2 pr-4 shadow-xs transition hover:shadow-sm"
        >
          <Avatar
            name={user?.name ?? 'Hervey Specter'}
            src={user?.avatar}
            size="sm"
            className="h-9 w-9 text-xs shadow-xs"
          />
          <div className="hidden text-left sm:block">
            <span className="block text-sm font-bold text-[#1B1F3B] leading-tight">
              {user?.name ?? 'Hervey Specter'}
            </span>
            <span className="block text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
              {user?.email ?? 'harveyspecter@gmail.com'}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" aria-hidden="true" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in duration-150"
          >
            <Link
              role="menuitem"
              href={ROUTES.PROFILE}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 transition"
            >
              <User className="h-4 w-4" aria-hidden="true" /> Profile
            </Link>
            <Link
              role="menuitem"
              href={ROUTES.SETTINGS}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-brand-50 transition"
            >
              <Settings className="h-4 w-4" aria-hidden="true" /> Settings
            </Link>
            <div className="my-2 border-t border-slate-100" />
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition text-left"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
