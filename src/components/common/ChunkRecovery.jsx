'use client';

import { useEffect } from 'react';

/**
 * Self-healing component for Next.js ChunkLoadError and 404 asset errors.
 * Automatically recovers from stale build manifests or asset mismatches.
 */
export default function ChunkRecovery() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tryRecover = () => {
      const KEY = 'jaa_last_chunk_recovery';
      const now = Date.now();
      const last = Number(sessionStorage.getItem(KEY) || 0);

      // Prevent reload loops: throttle to at most once every 12 seconds
      if (now - last > 12000) {
        sessionStorage.setItem(KEY, String(now));
        window.location.reload();
      }
    };

    // 1. Catch uncaught JS errors (e.g., ChunkLoadError)
    const handleWindowError = (event) => {
      const msg = event?.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module')
      ) {
        tryRecover();
      }
    };

    // 2. Catch network failures on <script> and <link> tags (e.g. 404 on _next/static/...)
    const handleResourceError = (event) => {
      const target = event?.target;
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const src = target.src || target.href || '';
        if (src.includes('/_next/static/')) {
          tryRecover();
        }
      }
    };

    // 3. Catch unhandled promise rejections for dynamic import failures
    const handleRejection = (event) => {
      const reason = event?.reason;
      const msg = (typeof reason === 'string' ? reason : reason?.message) || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch dynamically imported module')
      ) {
        tryRecover();
      }
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('error', handleResourceError, true); // capture phase
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
