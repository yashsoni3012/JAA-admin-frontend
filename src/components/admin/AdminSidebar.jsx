'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { SIDEBAR_NAV } from '@/constants/navigation';
import LogoutModal from '@/components/common/LogoutModal';
import { cn } from '@/lib/utils';

// Sidebar contents with #EEF1FF background and smooth collapsible animations
export default function AdminSidebar({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onLogoutClick,
}) {
  const pathname = usePathname();
  const [internalLogoutOpen, setInternalLogoutOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNavigate) onNavigate();
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      setInternalLogoutOpen(true);
    }
  };

  const handleSidebarClick = (e) => {
    // If collapsed, clicking on empty space in the sidebar expands it
    if (collapsed && onToggleCollapse) {
      if (!e.target.closest('a') && !e.target.closest('button')) {
        onToggleCollapse();
      }
    }
  };

  return (
    <>
      <div
        onClick={handleSidebarClick}
        className={cn(
          'flex h-full flex-col bg-[#EEF1FF] py-8 transition-all duration-300 ease-in-out select-none',
          collapsed ? 'px-3 items-center cursor-pointer' : 'px-5'
        )}
        title={collapsed ? 'Click to expand sidebar' : undefined}
      >
        {/* Top Logo */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out flex items-center',
            collapsed ? 'justify-center px-0' : 'justify-start px-1'
          )}
        >
          <div
            className="flex items-center overflow-hidden cursor-pointer"
            onClick={() => {
              if (collapsed && onToggleCollapse) onToggleCollapse();
            }}
            title={collapsed ? 'Click to expand sidebar' : 'Jewellers Association Ahmedabad'}
          >
            <div
              className={cn(
                'relative overflow-hidden flex items-center justify-center transition-all duration-300',
                collapsed ? 'h-10 w-10' : 'h-[52px] md:h-[60px] w-[191px]'
              )}
            >
              <img
                src="/uploads/jaa-logo-1793261989412.png"
                alt="Jewellers Association Ahmedabad"
                className={cn(
                  'max-w-none transition-all duration-300',
                  collapsed
                    ? 'h-10 w-10 object-contain'
                    : 'w-[191px] h-[161px] object-contain'
                )}
              />
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          aria-label="Admin navigation"
          className={cn(
            'mt-8 flex-1 space-y-2 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out',
            collapsed ? 'w-full flex flex-col items-center' : 'w-full'
          )}
        >
          {SIDEBAR_NAV.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center transition-all duration-200 cursor-pointer',
                  collapsed
                    ? 'h-14 w-14 justify-center rounded-2xl'
                    : 'w-full gap-3.5 rounded-full px-5 py-3.5 font-medium',
                  isActive
                    ? 'bg-gradient-to-b from-[#2832A4] to-[#4A57EA] text-white font-semibold shadow-md shadow-[#2832A4]/25'
                    : 'text-slate-600 hover:bg-white/70 hover:text-ink'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-500'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-[15px]',
                    collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[160px] opacity-100'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div
          className={cn(
            'pt-4 transition-all duration-300 ease-in-out',
            collapsed ? 'w-full flex justify-center' : 'px-1'
          )}
        >
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'flex items-center justify-center bg-gradient-to-b from-[#FF1F1F] to-[#FF5A5F] hover:brightness-105 text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer active:scale-95',
              collapsed
                ? 'h-14 w-14 rounded-2xl p-0'
                : 'w-full gap-2.5 rounded-full py-3.5 px-6 text-[15px] font-semibold'
            )}
          >
            <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />

            <span
              className={cn(
                'transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-[15px] font-semibold',
                collapsed
                  ? 'max-w-0 opacity-0 pointer-events-none'
                  : 'max-w-[100px] opacity-100'
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

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
