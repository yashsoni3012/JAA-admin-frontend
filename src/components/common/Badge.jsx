import { cn } from '@/lib/utils';

// Status colours copied from the reference: Pending (amber), Approved (green), Rejected (red).
const VARIANTS = {
  Pending: 'border-amber-300 bg-amber-50 text-amber-600',
  pending: 'border-amber-300 bg-amber-50 text-amber-600',
  Approved: 'border-emerald-300 bg-emerald-50 text-emerald-600',
  approved: 'border-emerald-300 bg-emerald-50 text-emerald-600',
  Rejected: 'border-red-200 bg-red-50 text-red-600',
  rejected: 'border-red-200 bg-red-50 text-red-600',
  neutral: 'border-slate-200 bg-slate-50 text-slate-600',
};

export default function Badge({ status = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-4 py-1 text-xs font-semibold',
        VARIANTS[status] ?? VARIANTS.neutral,
        className
      )}
    >
      {children ?? status}
    </span>
  );
}
