import Link from 'next/link';
import { cn } from '@/lib/utils';

// Single KPI tile used on the admin dashboard.
export default function StatCard({ label, value, icon: Icon, accent = 'brand', href }) {
  const accents = {
    brand: 'bg-[#EEF1FF] text-[#2832A4]',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const content = (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-3xl border border-white bg-white p-5 sm:p-6 shadow-card transition-all duration-200 select-none',
        href && 'hover:shadow-lg hover:-translate-y-0.5 hover:border-[#2832A4]/20 cursor-pointer'
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105',
          accents[accent] || accents.brand
        )}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-slate-500 truncate">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-ink mt-0.5 tracking-tight">
          {value !== undefined && value !== null ? value : 0}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
