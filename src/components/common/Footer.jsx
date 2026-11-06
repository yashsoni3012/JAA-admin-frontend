'use client';

import React from 'react';

export default function Footer({ className = '', showDeveloper = false }) {
  // Admin view: only copyrighted text centered
  if (!showDeveloper) {
    return (
      <footer className={`w-full py-4 px-4 text-center select-none ${className}`}>
        <p className="text-xs sm:text-sm text-slate-500 font-normal">
          &copy; 2026{' '}
          <a
            href="https://headway.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2832A4] hover:text-[#4A57EA] hover:underline transition-colors inline-block cursor-pointer"
          >
            Headway Business Solutions LLP
          </a>
          . All rights reserved.
        </p>
      </footer>
    );
  }

  // Website view: Left side copyright + Right side Design & Developed by
  return (
    <footer className={`w-full py-4 px-4 sm:px-8 select-none ${className}`}>
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm text-slate-500 font-normal">
        {/* Left Side: Copyright */}
        <p className="text-center sm:text-left">
          &copy; 2026{' '}
          <a
            href="https://headway.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2832A4] hover:text-[#4A57EA] hover:underline transition-colors"
          >
            Headway Business Solutions LLP
          </a>
          . All rights reserved.
        </p>

        {/* Right Side: Design & Developed by */}
        <p className="text-center sm:text-right">
          Design &amp; Developed by{' '}
          <a
            href="https://headway.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#2832A4] hover:text-[#4A57EA] hover:underline transition-colors"
          >
            Headway Business Solutions LLP
          </a>
        </p>
      </div>
    </footer>
  );
}
