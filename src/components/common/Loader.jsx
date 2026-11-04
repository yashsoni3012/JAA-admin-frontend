import { cn } from '@/lib/utils';

export default function Loader({ label = 'Loading', className }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('w-full max-w-lg mx-auto space-y-3 p-4', className)}
    >
      <div className="h-4 w-36 rounded-md bg-slate-200/80 animate-pulse" />
      <div className="h-10 w-full rounded-2xl bg-slate-200/80 animate-pulse" />
      <div className="h-10 w-full rounded-2xl bg-slate-200/80 animate-pulse" />
    </div>
  );
}
