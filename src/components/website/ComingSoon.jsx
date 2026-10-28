import { SITE } from '@/config/site';
import Logo from '@/components/common/Logo';

export default function ComingSoon() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6">
      {/* Decorative background shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-100 opacity-70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-red-100 opacity-60 blur-3xl" />

      <div className="relative w-full max-w-2xl text-center">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">{SITE.name}</p>
        <h1 className="mt-4 text-4xl font-black text-ink sm:text-6xl">Coming Soon</h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-500">{SITE.launchMessage}</p>
      </div>
    </main>
  );
}
