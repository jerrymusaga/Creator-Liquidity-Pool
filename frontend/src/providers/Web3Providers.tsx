// providers/Web3Provider.tsx
'use client'

import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider} from '@rainbow-me/rainbowkit'
import { rainbowKitTheme, wagmiConfig } from '@/config/wagmi'
// import { rainbowKitTheme } from '@/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          // theme={darkTheme()}
          showRecentTransactions={true}
          appInfo={{
            appName: 'Vibe - Creator Coins',
            disclaimer: ({ Text, Link }: { Text: React.FC<{ children: React.ReactNode }>; Link: React.FC<{ children: React.ReactNode; href: string }> }) => (
              <Text>
                <div className="text-center text-sm text-gray-400">
                  <p>By connecting your wallet, you agree to our Terms of Service.</p>
                  <p className="mt-2">Earn automatically with Zora V4 rewards! 🚀</p>
                  <Link href="https://docs.zora.co/coins">Learn more about V4 rewards</Link>
                </div>
              </Text>
            ),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}