// Simple bar chart built with plain Tailwind (no chart library needed).
// Values are illustrative sample data.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export default function DashboardChart({ values = [] }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-56 items-end gap-3 pt-4" role="img" aria-label="Monthly new member sign-ups (sample data)">
      {values.map((value, index) => (
        <div key={MONTHS[index]} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs text-slate-500">{value}</span>
          <div
            className="w-full rounded-t-xl bg-gradient-to-t from-brand-600 to-brand-400 transition hover:opacity-80"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-xs text-slate-500">{MONTHS[index]}</span>
        </div>
      ))}
    </div>
  );
}
