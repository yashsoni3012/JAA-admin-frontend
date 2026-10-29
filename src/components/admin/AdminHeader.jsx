'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Avatar from '@/components/common/Avatar';
import { getAvatarUrl } from '@/services/admin.service';
import LogoutModal from '@/components/common/LogoutModal';
import { cn } from '@/lib/utils';

export default function AdminHeader({
  title,
  onMenuClick,
  sidebarCollapsed = false,
  onLogoutClick,
}) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [internalLogoutOpen, setInternalLogoutOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      setInternalLogoutOpen(true);
    }
  };

  return (
    <>
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
            <Menu
              className={cn(
                'h-5 w-5 text-[#3F4BC4] stroke-[2.2] transition-transform duration-300 ease-in-out',
                sidebarCollapsed && 'rotate-90'
              )}
            />
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
    className="flex items-center gap-4 rounded-full bg-white/70 hover:bg-white border border-white/80 py-2.5 pl-3 pr-5 shadow-sm transition hover:shadow-md"
  >
    <Avatar
      name={user?.name ?? 'Harvey Specter'}
      src={getAvatarUrl(user?.image || user?.avatar || user?.profilePhoto)}
      size="sm"
      className="h-12 w-12 text-sm shadow-sm"
    />

    <div className="hidden text-left sm:block">
      <span className="block text-base font-bold text-[#1B1F3B] leading-tight">
        {user?.name ?? 'Harvey Specter'}
      </span>
      <span className="block text-xs text-slate-400 font-medium leading-tight mt-1">
        {user?.email ?? 'harveyspecter@gmail.com'}
      </span>
    </div>

    <ChevronDown
      className="h-5 w-5 text-slate-400 shrink-0 ml-1"
      aria-hidden="true"
    />
  </button>

  {menuOpen && (
    <div
      role="menu"
      className="absolute right-0 z-30 mt-3 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl animate-in fade-in duration-150"
    >
      <Link
        role="menuitem"
        href={ROUTES.PROFILE}
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-brand-50 transition"
      >
        <User className="h-5 w-5" aria-hidden="true" />
        Profile
      </Link>

      <Link
        role="menuitem"
        href={ROUTES.SETTINGS}
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 hover:bg-brand-50 transition"
      >
        <Settings className="h-5 w-5" aria-hidden="true" />
        Settings
      </Link>

      <div className="my-2 border-t border-slate-100" />

      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition text-left cursor-pointer"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Logout
      </button>
    </div>
  )}
</div>

      </header>

      {/* Internal fallback if onLogoutClick was not passed */}
      {!onLogoutClick && (
        <LogoutModal
          open={internalLogoutOpen}
          onClose={() => setInternalLogoutOpen(false)}
        />
      )}
    </>
  );
}
