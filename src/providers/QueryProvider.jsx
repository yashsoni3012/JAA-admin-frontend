'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initApiInterceptor } from '@/lib/api-resolver';

// Initialize network & IP auto-resolver for all API fetches
if (typeof window !== 'undefined') {
  initApiInterceptor();
}

export default function QueryProvider({ children }) {
  useEffect(() => {
    initApiInterceptor();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
            gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

