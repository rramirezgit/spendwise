'use client'

import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/lib/i18n'

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2_000,
            refetchInterval: 5_000,
            refetchIntervalInBackground: false,
            refetchOnWindowFocus: true,
          },
        },
      })
  )
  return (
    <SessionProvider>
      <LanguageProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
