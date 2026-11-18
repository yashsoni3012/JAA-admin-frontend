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
  const [flyoutTop, setFlyoutTop] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Read current message tab reactively from searchParams
  const tab = searchParams?.get('tab');
  const isGroupActive = tab === 'group' || tab === 'groups' || tab === 'group_message';
  const isMessagesActive = pathname === '/admin/messages' || pathname.startsWith('/admin/messages/');

  // Close collapsed flyout and tooltip when route changes or when un-collapsing
  useEffect(() => {
    setCollapsedFlyoutOpen(false);
    setHoveredItem(null);
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

  const handleMouseEnter = (label, isLogout = false) => (e) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem({
      label,
      top: rect.top + rect.height / 2,
      isLogout,
    });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <>
      <div
        onClick={handleSidebarClick}
        className={cn(
          'flex h-full flex-col bg-[#EEF1FF] py-6 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] select-none',
          collapsed ? 'px-[17px] items-center cursor-pointer' : 'px-5 items-start'
        )}
      >
        {/* Top Logo: smoothly animates dimensions between opened and collapsed */}
        <div
          className={cn(
            'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center h-[70px] shrink-0 w-full',
            collapsed ? 'justify-center px-0' : 'justify-start px-1'
          )}
        >
          <div
            className="flex items-center cursor-pointer overflow-hidden"
            onClick={() => {
              if (collapsed && onToggleCollapse) onToggleCollapse();
            }}
            onMouseEnter={handleMouseEnter('Expand Sidebar')}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className={cn(
                'relative flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                collapsed ? 'w-[50px] h-[50px]' : 'w-[191px] h-[70px]'
              )}
            >
              <img
                src="/uploads/jaa-logo-1793261989412.png"
                alt="Jewellers Association Ahmedabad"
                className={cn(
                  'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] object-contain',
                  collapsed
                    ? 'w-[72px] h-auto max-h-[50px]'
                    : 'w-[191px] h-auto'
                )}
              />
            </div>
          </div>
        </div>

        {/* Navigation List: exact same mt-6 and space-y-2 so every icon stays at identical Y-position */}
        <nav
          aria-label="Admin navigation"
          onScroll={() => setHoveredItem(null)}
          className={cn(
            'mt-6 space-y-2 flex-1 min-h-0 overflow-y-auto no-scrollbar transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            collapsed ? 'w-full flex flex-col items-center' : 'w-full'
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
              return (
                <div
                  key={item.href}
                  className={cn(
                    'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shrink-0',
                    collapsed ? 'w-[50px]' : 'w-full'
                  )}
                >
                  <div className="relative flex items-center">
                    <Link
                      href="/admin/messages?tab=broadcast"
                      prefetch={true}
                      onClick={(e) => {
                        if (collapsed) {
                          e.preventDefault();
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setFlyoutTop(rect.top);
                          setHoveredItem(null);
                          setCollapsedFlyoutOpen((prev) => !prev);
                        } else {
                          if (onNavigate) onNavigate();
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (collapsed) handleMouseEnter(item.label)(e);
                      }}
                      onMouseLeave={handleMouseLeave}
                      className={cn(
                        'group flex items-center h-[50px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer select-none overflow-hidden shrink-0',
                        collapsed
                          ? 'w-[50px] rounded-2xl justify-start'
                          : 'w-full rounded-full justify-between pr-3',
                        isActive
                          ? 'bg-gradient-to-b from-[#2832A4] to-[#4A57EA] text-white font-semibold shadow-md shadow-[#2832A4]/25'
                          : 'text-slate-600 hover:bg-white/70 hover:text-ink'
                      )}
                    >
                      <div className="flex items-center min-w-0">
                        {/* Stable fixed icon box */}
                        <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                          <Icon
                            className={cn(
                              'h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isActive ? 'text-white' : 'text-slate-500'
                            )}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Animated sliding text */}
                        <div
                          className={cn(
                            'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center',
                            collapsed
                              ? 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
                              : 'max-w-[120px] opacity-100 translate-x-0'
                          )}
                        >
                          <span className="text-[15px] font-medium tracking-normal select-none">
                            {item.label}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown toggle chevron */}
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
                        className={cn(
                          'p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer flex items-center justify-center shrink-0 transition-all duration-300',
                          collapsed ? 'w-0 opacity-0 scale-50 pointer-events-none hidden' : 'w-7 opacity-100 scale-100'
                        )}
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
                  {!collapsed && messagesOpen && (
                    <div className="ml-6 pl-3 border-l-2 border-indigo-200/70 space-y-1 py-1 mt-1 animate-in fade-in-50 duration-200">
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
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onMouseEnter={(e) => {
                  try {
                    router.prefetch(item.href);
                  } catch {}
                  handleMouseEnter(item.label)(e);
                }}
                onTouchStart={() => {
                  try {
                    router.prefetch(item.href);
                  } catch {}
                }}
                onMouseLeave={handleMouseLeave}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'group flex items-center h-[50px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer select-none overflow-hidden shrink-0',
                  collapsed
                    ? 'w-[50px] rounded-2xl justify-start'
                    : 'w-full rounded-full justify-start',
                  isActive
                    ? 'bg-gradient-to-b from-[#2832A4] to-[#4A57EA] text-white font-semibold shadow-md shadow-[#2832A4]/25'
                    : 'text-slate-600 hover:bg-white/70 hover:text-ink'
                )}
              >
                {/* Stable fixed icon box */}
                <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
                  <Icon
                    className={cn(
                      'h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-500'
                    )}
                    aria-hidden="true"
                  />
                </div>

                {/* Animated sliding text */}
                <div
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center',
                    collapsed
                      ? 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
                      : 'max-w-[150px] opacity-100 translate-x-0'
                  )}
                >
                  <span className="text-[15px] font-medium tracking-normal select-none">
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button: exact same pt-4 and Y position with smooth animated morphing */}
        <div
          className={cn(
            'shrink-0 pt-4 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            collapsed ? 'w-[50px] flex justify-center' : 'w-full'
          )}
        >
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={handleMouseEnter('Logout', true)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'group flex items-center h-[50px] bg-gradient-to-b from-[#FF1F1F] to-[#FF5A5F] hover:brightness-105 text-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-lg cursor-pointer active:scale-95 shrink-0 overflow-hidden',
              collapsed
                ? 'w-[50px] rounded-2xl justify-start'
                : 'w-full rounded-full justify-start'
            )}
          >
            {/* Stable fixed icon box */}
            <div className="w-[50px] h-[50px] flex items-center justify-center shrink-0">
              <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
            </div>

            {/* Animated sliding text */}
            <div
              className={cn(
                'overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center',
                collapsed
                  ? 'max-w-0 opacity-0 -translate-x-3 pointer-events-none'
                  : 'max-w-[90px] opacity-100 translate-x-0'
              )}
            >
              <span className="text-[15px] font-semibold select-none">Logout</span>
            </div>
          </button>
        </div>
      </div>

      {/* Floating Tooltip in Collapsed Mode */}
      {collapsed && hoveredItem && !collapsedFlyoutOpen && (
        <div
          role="tooltip"
          style={{ top: hoveredItem.top }}
          className="pointer-events-none fixed left-[92px] -translate-y-1/2 z-[9999] animate-in fade-in-0 zoom-in-95 duration-150 ease-out"
        >
          <div
            className={cn(
              'relative flex items-center text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-white/10 tracking-wide',
              hoveredItem.isLogout
                ? 'bg-[#DC2626] shadow-red-500/25'
                : 'bg-[#1E2580] shadow-[#1E2580]/25'
            )}
          >
            <div
              className={cn(
                'absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-l border-b border-white/10',
                hoveredItem.isLogout ? 'bg-[#DC2626]' : 'bg-[#1E2580]'
              )}
            />
            <span className="relative z-10 select-none">{hoveredItem.label}</span>
          </div>
        </div>
      )}

      {/* Messages Flyout in Collapsed Mode */}
      {collapsed && collapsedFlyoutOpen && flyoutTop !== null && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsedFlyoutOpen(false);
            }}
          />
          <div
            style={{ top: flyoutTop }}
            className="fixed left-[92px] z-[9999] w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95"
          >
            <Link
              href="/admin/messages?tab=broadcast"
              prefetch={true}
              onClick={() => {
                setCollapsedFlyoutOpen(false);
                if (onNavigate) onNavigate();
              }}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition',
                isMessagesActive && !isGroupActive
                  ? 'bg-indigo-50 text-[#2832A4] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Radio className="h-4 w-4" />
              <span>Broadcast (default)</span>
            </Link>
            <Link
              href="/admin/messages?tab=group"
              prefetch={true}
              onClick={() => {
                setCollapsedFlyoutOpen(false);
                if (onNavigate) onNavigate();
              }}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition mt-1',
                isMessagesActive && isGroupActive
                  ? 'bg-indigo-50 text-[#2832A4] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <Users className="h-4 w-4" />
              <span>Group Message</span>
            </Link>
          </div>
        </>
      )}

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
