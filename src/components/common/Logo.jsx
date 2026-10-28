import { SITE } from '@/config/site';

// Text-based logo that mirrors the reference design. Replace the inner markup
// with an <Image src="/logo.png" /> when the real logo file is available.
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl font-black italic leading-none text-red-600" aria-hidden="true">
        Jaa
      </span>
      {!compact && (
        <span className="font-serif text-[11px] leading-tight text-brand-700">
          <span className="block font-semibold">Jewellers</span>
          <span className="block font-semibold">Association</span>
          <span className="block font-semibold">Ahmedabad</span>
        </span>
      )}
      <span className="sr-only">{SITE.name}</span>
    </div>
  );
}
