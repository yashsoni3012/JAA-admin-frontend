'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Shows initials on a soft brand background. Pass `src` to use a real photo.
export default function Avatar({ name = '', src, size = 'md', className }) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  if (src && !hasError) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white select-none',
        sizes[size],
        className
      )}
    >
      {initials || '?'}
    </span>
  );
}
