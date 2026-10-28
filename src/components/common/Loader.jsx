import { cn } from '@/lib/utils';

export default function Loader({ label = 'Loading', className }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex flex-col items-center gap-3', className)}>
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
      <span className="text-sm text-slate-500">{label}…</span>
    </div>
  );
}
