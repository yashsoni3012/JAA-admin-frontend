'use client';

import { useEffect } from 'react';

// Catches unexpected errors in any route segment below the root layout.
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div role="alert" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-500">
          An unexpected error occurred. You can try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-active transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
