import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.HOME}
            className="rounded-full border border-brand-500 px-6 py-2.5 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
          >
            Go to homepage
          </Link>
          <Link
            href={ROUTES.DASHBOARD}
            className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-active transition hover:opacity-90"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
