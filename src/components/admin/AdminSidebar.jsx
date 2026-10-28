'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { SIDEBAR_NAV } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

// Sidebar contents with #EEF1FF background and smooth collapsible animations
export default function AdminSidebar({ onNavigate, collapsed = false, onToggleCollapse }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
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

  const handleSidebarClick = (e) => {
    // If collapsed, clicking on empty space in the sidebar expands it
    if (collapsed && onToggleCollapse) {
      if (!e.target.closest('a') && !e.target.closest('button')) {
        onToggleCollapse();
      }
    }
  };

  return (
    <div
      onClick={handleSidebarClick}
      className={cn(
        'flex h-full flex-col bg-[#EEF1FF] py-7 transition-all duration-300 ease-in-out select-none',
        collapsed ? 'px-2.5 items-center cursor-pointer' : 'px-5'
      )}
      title={collapsed ? 'Click to expand sidebar' : undefined}
    >
      {/* Top Logo */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out flex items-center pt-1',
          collapsed ? 'justify-center px-0' : 'justify-between px-3'
        )}
      >
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          onClick={() => {
            if (collapsed && onToggleCollapse) onToggleCollapse();
          }}
          title={collapsed ? 'Click to expand sidebar' : undefined}
        >
          <span className="text-4xl font-black italic leading-none text-red-600 shrink-0" aria-hidden="true">
            Jaa
          </span>
          <span
            className={cn(
              'font-serif text-[11px] leading-tight text-brand-700 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden',
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'
            )}
          >
            <span className="block font-semibold">Jewellers</span>
            <span className="block font-semibold">Association</span>
            <span className="block font-semibold">Ahmedabad</span>
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav
        aria-label="Admin navigation"
        className={cn(
          'mt-8 flex-1 space-y-1.5 overflow-y-auto no-scrollbar transition-all duration-300 ease-in-out',
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
                'relative flex items-center transition-all duration-300 ease-in-out group',
                collapsed
                  ? 'h-12 w-12 mx-auto justify-center rounded-2xl p-0'
                  : 'w-full gap-4 rounded-full px-5 py-3 text-sm font-semibold',
                isActive
                  ? 'bg-gradient-to-r from-[#2832A4] to-[#4F5DEC] text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-white/70 hover:text-ink'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-white' : 'text-slate-500'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-sm',
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
      <div className={cn('pt-4 transition-all duration-300 ease-in-out', collapsed ? 'w-full flex justify-center' : 'px-1')}>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center justify-center bg-[#E03A3A] hover:bg-[#c93030] text-white shadow-md transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer active:scale-95',
            collapsed
              ? 'h-12 w-12 rounded-2xl p-0'
              : 'w-full gap-2.5 rounded-full py-3 px-4 text-sm font-semibold'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span
            className={cn(
              'transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-sm font-semibold',
              collapsed ? 'max-w-0 opacity-0 pointer-events-none' : 'max-w-[100px] opacity-100'
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}