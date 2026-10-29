// import Link from 'next/link';
// import { ROUTES } from '@/constants/routes';

// export const metadata = { title: 'Page not found' };

// export default function NotFound() {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-surface px-4">
//       <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-card">
//         <p className="text-sm font-semibold uppercase tracking-widest text-brand-500">Error 404</p>
//         <h1 className="mt-3 text-3xl font-bold text-ink">Page not found</h1>
//         <p className="mt-3 text-sm text-slate-500">
//           The page you are looking for does not exist or has been moved.
//         </p>
//         <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
//           <Link
//             href={ROUTES.HOME}
//             className="rounded-full border border-brand-500 px-6 py-2.5 text-sm font-semibold text-brand-500 transition hover:bg-brand-50"
//           >
//             Go to homepage
//           </Link>
//           <Link
//             href={ROUTES.DASHBOARD}
//             className="rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-active transition hover:opacity-90"
//           >
//             Go to dashboard
//           </Link>
//         </div>
//       </div>
//     </main>
//   );
// }

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

const RED = '#E11D26';
const NAVY = '#1E2A78';
const SUPPORT_HREF = '/contact'; // change to your real support/contact route

/* ---------- Small reusable pieces ---------- */

function GemIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="nf-gem" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#B7C7FF" />
          <stop offset="45%" stopColor="#4D66D8" />
          <stop offset="100%" stopColor="#1B2A86" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E6F2" strokeWidth="2" />
      <circle cx="50" cy="50" r="36" fill="url(#nf-gem)" />
      <g fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="1.4" strokeLinejoin="round">
        <polygon points="34,20 66,20 80,34 80,66 66,80 34,80 20,66 20,34" />
        <polygon points="50,32 64,50 50,68 36,50" />
        <line x1="34" y1="20" x2="50" y2="32" />
        <line x1="66" y1="20" x2="50" y2="32" />
        <line x1="80" y1="34" x2="64" y2="50" />
        <line x1="80" y1="66" x2="64" y2="50" />
        <line x1="66" y1="80" x2="50" y2="68" />
        <line x1="34" y1="80" x2="50" y2="68" />
        <line x1="20" y1="66" x2="36" y2="50" />
        <line x1="20" y1="34" x2="36" y2="50" />
      </g>
    </svg>
  );
}

function JbaLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center leading-none" style={{ color: RED }}>
        <span className="text-6xl font-black tracking-tight">JAA</span>
      </div>
      <div className="font-serif font-bold leading-tight" style={{ color: NAVY }}>
        <p className="text-lg">Jewellers</p>
        <p className="text-lg">Association</p>
        <p className="text-lg">Ahmedabad</p>
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="2" />
      <rect x="17" y="13" width="4" height="6" rx="2" />
      <path d="M19 19c0 1.5-2 2.5-5 2.5" />
    </svg>
  );
}

/* ---------- Right-side illustration ---------- */

function Illustration() {
  return (
    <svg viewBox="0 0 560 520" className="h-auto w-full max-w-[560px]" aria-hidden="true">
      <defs>
        <pattern id="nf-stripes" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
          <rect width="36" height="36" fill="#FFFFFF" />
          <rect width="18" height="36" fill={RED} />
        </pattern>
        <radialGradient id="nf-bulb" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8FA8FF" />
          <stop offset="100%" stopColor="#2F4BD6" />
        </radialGradient>
      </defs>

      {/* Faint background city */}
      <g fill="#E9ECF6" opacity="0.7">
        <rect x="360" y="230" width="50" height="190" rx="4" />
        <rect x="415" y="160" width="70" height="260" rx="6" />
        <rect x="490" y="120" width="60" height="300" rx="6" />
      </g>

      {/* Clouds */}
      <g fill="#FFFFFF" stroke="#E3E6F2" strokeWidth="1.5">
        <ellipse cx="250" cy="110" rx="28" ry="18" />
        <ellipse cx="275" cy="98" rx="30" ry="24" />
        <ellipse cx="302" cy="110" rx="26" ry="18" />
        <ellipse cx="410" cy="88" rx="24" ry="16" />
        <ellipse cx="432" cy="78" rx="26" ry="20" />
        <ellipse cx="456" cy="88" rx="22" ry="15" />
      </g>

      {/* Sparkles */}
      <g fill={RED} fontSize="18" fontWeight="700">
        <text x="260" y="130">+</text>
        <text x="60" y="290">+</text>
        <text x="450" y="300">+</text>
      </g>
      <g fill="#3D57D6" fontSize="16" fontWeight="700">
        <text x="98" y="190">+</text>
        <text x="500" y="210">+</text>
      </g>

      {/* Monitor */}
      <rect x="110" y="110" width="330" height="250" rx="22" fill="#E9EBF5" stroke="#D5D9EA" strokeWidth="2" />
      <rect x="122" y="122" width="306" height="226" rx="14" fill="#FFFFFF" />
      <rect x="122" y="122" width="306" height="30" rx="14" fill="#F5F6FA" />
      <circle cx="140" cy="137" r="5" fill="#F0524F" />
      <circle cx="156" cy="137" r="5" fill="#F5B942" />
      <circle cx="172" cy="137" r="5" fill="#39C26B" />

      {/* Monitor stand */}
      <path d="M250 360 L300 360 L312 432 L238 432 Z" fill="#E9EBF5" stroke="#D5D9EA" strokeWidth="2" />
      <rect x="220" y="430" width="110" height="18" rx="9" fill="#E9EBF5" stroke="#D5D9EA" strokeWidth="2" />

      {/* Sad document */}
      <path
        d="M240 190 H296 L324 218 V300 Q324 312 312 312 H240 Q228 312 228 300 V202 Q228 190 240 190 Z"
        fill="#FFFFFF"
        stroke="#D5D9EA"
        strokeWidth="2"
      />
      <path d="M296 190 V218 H324" fill="#EEF0F7" stroke="#D5D9EA" strokeWidth="2" />
      <g stroke="#B5BAD0" strokeWidth="4" strokeLinecap="round">
        <line x1="252" y1="226" x2="264" y2="240" />
        <line x1="264" y1="226" x2="252" y2="240" />
        <line x1="288" y1="226" x2="300" y2="240" />
        <line x1="300" y1="226" x2="288" y2="240" />
      </g>
      <path d="M256 282 Q276 266 296 282" fill="none" stroke="#B5BAD0" strokeWidth="4" strokeLinecap="round" />

      {/* Barricade posts */}
      <g fill="#FFFFFF" stroke="#D7DAE6" strokeWidth="2">
        <rect x="300" y="318" width="12" height="170" rx="6" />
        <rect x="476" y="318" width="12" height="170" rx="6" />
      </g>
      <g fill="#E9EBF5">
        <ellipse cx="306" cy="490" rx="20" ry="7" />
        <ellipse cx="482" cy="490" rx="20" ry="7" />
      </g>
      <circle cx="306" cy="312" r="12" fill="url(#nf-bulb)" />
      <circle cx="482" cy="312" r="12" fill="url(#nf-bulb)" />

      {/* Barricade bars */}
      <rect x="280" y="330" width="220" height="46" rx="6" fill="url(#nf-stripes)" stroke="#D7DAE6" strokeWidth="2" />
      <rect x="280" y="390" width="220" height="46" rx="6" fill="url(#nf-stripes)" stroke="#D7DAE6" strokeWidth="2" />

      {/* Traffic cone */}
      <polygon points="500,380 520,380 552,474 468,474" fill="#FFFFFF" stroke="#D7DAE6" strokeWidth="2" />
      <polygon points="488,412 532,412 542,440 478,440" fill={RED} />
      <polygon points="482,456 538,456 546,470 474,470" fill={RED} />
      <rect x="456" y="470" width="108" height="14" rx="5" fill={RED} />
    </svg>
  );
}

/* ---------- Main page ---------- */

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-6 py-12">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* Left content */}
        <section className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <JbaLogo />

          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
            <span className="text-[7rem] font-extrabold leading-none sm:text-[9rem]" style={{ color: RED }}>
              4
            </span>
            <GemIcon className="h-28 w-28 drop-shadow-md sm:h-36 sm:w-36" />
            <span className="text-[7rem] font-extrabold leading-none sm:text-[9rem]" style={{ color: RED }}>
              4
            </span>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#141A2E] sm:text-4xl">Oops! Page Not Found</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            The page you are looking for doesn’t exist
            <br />
            or may have been moved.
          </p>

          <div className="mt-6 flex w-full items-center gap-3">
            <span className="h-px flex-1" style={{ backgroundColor: RED }} />
            <GemIcon className="h-5 w-5" />
            <span className="h-px flex-1" style={{ backgroundColor: RED }} />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex w-full flex-col gap-4 sm:flex-row">
            <Link
              href={ROUTES.DASHBOARD}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(225,29,38,0.6)] transition hover:opacity-90"
              style={{ backgroundColor: RED }}
            >
              <HomeIcon />
              Back to Dashboard
            </Link>

          </div>

        </section>

        {/* Right illustration */}
        <div className="hidden lg:flex lg:justify-center">
          <Illustration />
        </div>
      </div>
    </main>
  );
}