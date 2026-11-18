'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogOut, ChevronDown, Radio, Users } from 'lucide-react';
import { SIDEBAR_NAV } from '@/constants/navigation';
import LogoutModal from '@/components/common/LogoutModal';
import { cn } from '@/lib/utils';

export default function AdminSidebar(props) {
  return (
    <Suspense fallback={null}>
      <AdminSidebarInner {...props} />
    </Suspense>
  );
}

function AdminSidebarInner({
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  onLogoutClick,
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [internalLogoutOpen, setInternalLogoutOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [collapsedFlyoutOpen, setCollapsedFlyoutOpen] = useState(false);

  // Read current message tab reactively from searchParams
  const tab = searchParams?.get('tab');
  const isGroupActive = tab === 'group' || tab === 'groups' || tab === 'group_message';

  // Close collapsed flyout when route changes or when un-collapsing
  useEffect(() => {
    setCollapsedFlyoutOpen(false);
  }, [pathname, collapsed]);

  // Eagerly prefetch all admin routes in the background on mount for instant zero-latency navigation
  useEffect(() => {
    SIDEBAR_NAV.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {
        // ignore
      }
    });
    try {
      router.prefetch('/admin/messages?tab=broadcast');
      router.prefetch('/admin/messages?tab=group');
    } catch {}
  }, [router]);

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
          collapsed ? 'px-1.5 items-center cursor-pointer overflow-visible' : 'px-5'
        )}
      >
        {/* Top Logo */}
        <div
          className={cn(
            'transition-all duration-300 ease-in-out flex items-center',
            collapsed ? 'justify-center w-full px-0' : 'justify-start px-1'
          )}
        >
          <div
            className="flex items-center cursor-pointer relative group"
            onClick={() => {
              if (collapsed && onToggleCollapse) onToggleCollapse();
            }}
          >
            <div
              className={cn(
                'relative flex items-center justify-center transition-all duration-300',
                collapsed ? 'w-[76px] h-[52px]' : 'w-[191px] h-[70px]'
              )}
            >
              <img
                src="/uploads/jaa-logo-1793261989412.png"
                alt="Jewellers Association Ahmedabad"
                className={cn(
                  'transition-all duration-300 object-contain',
                  collapsed
                    ? 'w-[76px] h-auto max-h-[50px]'
                    : 'w-[191px] h-auto'
                )}
              />
            </div>

            {collapsed && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150 ease-out"
              >
                <div className="relative flex items-center bg-[#1E2580] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl shadow-[#1E2580]/20 whitespace-nowrap border border-white/10 tracking-wide">
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1E2580] rotate-45 border-l border-b border-white/10" />
                  <span className="relative z-10 select-none">Expand Sidebar</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav
          aria-label="Admin navigation"
          className={cn(
            'mt-8 flex-1 transition-all duration-300 ease-in-out',
            collapsed
              ? 'w-full flex flex-col items-center space-y-2 overflow-visible'
              : 'w-full space-y-2 overflow-y-auto no-scrollbar'
          )}
        >
          {SIDEBAR_NAV.map((item) => {
            const isMessages = item.label === 'Messages' || item.href === '/admin/messages';
            const isActive = isMessages
              ? pathname === '/admin/messages' || pathname.startsWith('/admin/messages/')
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            // 1. Messages item with dropdown (Broadcast default & Group Message)
            if (isMessages) {
              if (collapsed) {
                return (
                  <div
                    key={item.href}
                    className="relative group"
                    onMouseLeave={() => setCollapsedFlyoutOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setCollapsedFlyoutOpen((prev) => !prev)}
                      className={cn(
                        'h-14 w-14 justify-center rounded-2xl flex items-center transition-all duration-200 cursor-pointer',
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
                    </button>

                    {/* Tooltip on hover when flyout is closed */}
                    {!collapsedFlyoutOpen && (
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150 ease-out"
                      >
                        <div className="relative flex items-center bg-[#1E2580] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl shadow-[#1E2580]/20 whitespace-nowrap border border-white/10 tracking-wide">
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1E2580] rotate-45 border-l border-b border-white/10" />
                          <span className="relative z-10 select-none">Messages</span>
                        </div>
                      </div>
                    )}

                    {collapsedFlyoutOpen && (
                      <div className="absolute left-full top-0 ml-3.5 z-50 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                        <Link
                          href="/admin/messages?tab=broadcast"
                          onClick={() => {
                            setCollapsedFlyoutOpen(false);
                            if (onNavigate) onNavigate();
                          }}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition',
                            isActive && !isGroupActive
                              ? 'bg-indigo-50 text-[#2832A4] font-bold'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <Radio className="h-4 w-4" />
                          <span>Broadcast (default)</span>
                        </Link>
                        <Link
                          href="/admin/messages?tab=group"
                          onClick={() => {
                            setCollapsedFlyoutOpen(false);
                            if (onNavigate) onNavigate();
                          }}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition mt-1',
                            isActive && isGroupActive
                              ? 'bg-indigo-50 text-[#2832A4] font-bold'
                              : 'text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          <Users className="h-4 w-4" />
                          <span>Group Message</span>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.href} className="w-full space-y-1">
                  <div className="relative flex items-center">
                    <Link
                      href="/admin/messages?tab=broadcast"
                      prefetch={true}
                      onClick={() => {
                        if (onNavigate) onNavigate();
                      }}
                      className={cn(
                        'group flex items-center justify-between transition-all duration-200 cursor-pointer w-full rounded-full px-5 py-3.5 font-medium select-none',
                        isActive
                          ? 'bg-gradient-to-b from-[#2832A4] to-[#4A57EA] text-white font-semibold shadow-md shadow-[#2832A4]/25'
                          : 'text-slate-600 hover:bg-white/70 hover:text-ink'
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={cn(
                            'h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110',
                            isActive ? 'text-white' : 'text-slate-500'
                          )}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap overflow-hidden text-[15px]">
                          {item.label}
                        </span>
                      </div>

                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="Toggle messages dropdown"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMessagesOpen((prev) => !prev);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            setMessagesOpen((prev) => !prev);
                          }
                        }}
                        className="p-1.5 -mr-1 rounded-full hover:bg-white/20 transition cursor-pointer flex items-center justify-center"
                      >
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform duration-200',
                            isActive ? 'text-white/80' : 'text-slate-400',
                            messagesOpen && 'rotate-180'
                          )}
                        />
                      </span>
                    </Link>
                  </div>

                  {/* Dropdown Menu in Sidebar for Broadcast & Group Message */}
                  {messagesOpen && (
                    <div className="ml-5 pl-3 border-l-2 border-indigo-200/70 space-y-1 py-1 animate-in fade-in-50 duration-200">
                      <Link
                        href="/admin/messages?tab=broadcast"
                        prefetch={true}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer',
                          isActive && !isGroupActive
                            ? 'bg-white text-[#2832A4] font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-white/60 hover:text-ink'
                        )}
                      >
                        <Radio className="h-3.5 w-3.5" />
                        <span>Broadcast (default)</span>
                      </Link>

                      <Link
                        href="/admin/messages?tab=group"
                        prefetch={true}
                        onClick={onNavigate}
                        className={cn(
                          'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer',
                          isActive && isGroupActive
                            ? 'bg-white text-[#2832A4] font-bold shadow-xs'
                            : 'text-slate-600 hover:bg-white/60 hover:text-ink'
                        )}
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Group Message</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            // Normal menu items
            return (
              <div
                key={item.href}
                className={cn('relative', collapsed ? 'group' : 'w-full')}
              >
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => {
                    try {
                      router.prefetch(item.href);
                    } catch {}
                  }}
                  onTouchStart={() => {
                    try {
                      router.prefetch(item.href);
                    } catch {}
                  }}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center transition-all duration-200 cursor-pointer',
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

                {collapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150 ease-out"
                  >
                    <div className="relative flex items-center bg-[#1E2580] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl shadow-[#1E2580]/20 whitespace-nowrap border border-white/10 tracking-wide">
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1E2580] rotate-45 border-l border-b border-white/10" />
                      <span className="relative z-10 select-none">{item.label}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div
          className={cn(
            'pt-4 transition-all duration-300 ease-in-out relative group',
            collapsed ? 'w-full flex justify-center' : 'px-1'
          )}
        >
          <button
            type="button"
            onClick={handleLogout}
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

          {collapsed && (
            <div
              role="tooltip"
              className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-50 opacity-0 invisible -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:translate-x-0 transition-all duration-150 ease-out"
            >
              <div className="relative flex items-center bg-[#DC2626] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl shadow-red-500/20 whitespace-nowrap border border-white/10 tracking-wide">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#DC2626] rotate-45 border-l border-b border-white/10" />
                <span className="relative z-10 select-none">Logout</span>
              </div>
            </div>
          )}
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
