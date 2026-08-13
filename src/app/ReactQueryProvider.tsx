import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
