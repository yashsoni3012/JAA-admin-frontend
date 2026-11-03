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
  const [messagesOpen, setMessagesOpen] = useState(true);
  const [collapsedFlyoutOpen, setCollapsedFlyoutOpen] = useState(false);

  // Read current message tab reactively from searchParams
  const tab = searchParams?.get('tab');
  const isGroupActive = tab === 'group' || tab === 'groups' || tab === 'group_message';

  // Automatically keep messages dropdown open when on /admin/messages
  useEffect(() => {
    if (pathname.startsWith('/admin/messages')) {
      setMessagesOpen(true);
    }
  }, [pathname]);

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
                'relative flex items-center justify-center transition-all duration-300',
                collapsed ? 'h-10 w-10 overflow-hidden' : 'w-[191px] h-[70px]'
              )}
            >
              <img
                src="/uploads/jaa-logo-1793261989412.png"
                alt="Jewellers Association Ahmedabad"
                className={cn(
                  'transition-all duration-300',
                  collapsed
                    ? 'h-10 w-10 object-contain'
                    : 'w-[191px] h-auto object-contain'
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
            const isMessages = item.label === 'Messages' || item.href === '/admin/messages';
            const isActive = isMessages
              ? pathname === '/admin/messages' || pathname.startsWith('/admin/messages/')
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            // 1. Messages item with dropdown (Broadcast default & Group Message)
            if (isMessages) {
              if (collapsed) {
                return (
                  <div key={item.href} className="relative">
                    <button
                      type="button"
                      onClick={() => setCollapsedFlyoutOpen((prev) => !prev)}
                      title="Messages: Broadcast & Group Message"
                      className={cn(
                        'h-14 w-14 justify-center rounded-2xl group flex items-center transition-all duration-200 cursor-pointer',
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

                    {collapsedFlyoutOpen && (
                      <div className="absolute left-full top-0 ml-3 z-50 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
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
                  <div
                    onClick={() => {
                      setMessagesOpen((prev) => !prev);
                      if (!isActive) {
                        router.push('/admin/messages?tab=broadcast');
                        if (onNavigate) onNavigate();
                      }
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

                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200',
                        isActive ? 'text-white/80' : 'text-slate-400',
                        messagesOpen && 'rotate-180'
                      )}
                    />
                  </div>

                  {/* Dropdown Menu in Sidebar for Broadcast & Group Message */}
                  {messagesOpen && (
                    <div className="ml-5 pl-3 border-l-2 border-indigo-200/70 space-y-1 py-1 animate-in fade-in-50 duration-200">
                      <Link
                        href="/admin/messages?tab=broadcast"
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
