import { cn } from '@/lib/utils';

// Single KPI tile used on the dashboard.
export default function StatCard({ label, value, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-500',
    green: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
    red: 'bg-red-50 text-red-500',
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', accents[accent])}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
