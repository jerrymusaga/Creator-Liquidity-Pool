"use client";

import React, { useEffect, useState, PropsWithChildren } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider} from '@rainbow-me/rainbowkit'
import { rainbowKitTheme, wagmiConfig } from '@/config/wagmi'
import '@rainbow-me/rainbowkit/styles.css'
import { SessionProvider } from "next-auth/react";
import { AuthKitProvider } from "@farcaster/auth-kit";
import "@farcaster/auth-kit/styles.css";
import { sdk } from "@farcaster/frame-sdk";
import { connect } from "wagmi/actions";
import farcasterFrame from "@farcaster/frame-wagmi-connector";

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://alfajores-forno.celo-testnet.org",
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "ads-bazaar.vercel.app",
  siweUri: process.env.NEXT_PUBLIC_APP_URL || "https://ads-bazaar.vercel.app",
};

function FarcasterFrameProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;

      // Autoconnect if running in a frame
      if (context?.client.clientFid) {
        try {
          await connect(wagmiConfig, { 
            connector: farcasterFrame()
          });
        } catch (error) {
          console.error("Failed to connect Farcaster frame:", error);
        }
      }

      // Hide splash screen after UI renders
      setTimeout(() => {
        sdk.actions.ready();
      }, 500);
    };
    init();
  }, []);

  return <>{children}</>;
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false, // Prevent aggressive refetching on window focus
        refetchOnMount: false, // Prevent refetch on component mount if data exists
        retry: (failureCount, error) => {
          // Only retry on network errors, not on contract revert errors
          return failureCount < 2 && !error?.message?.includes('execution reverted');
        },
      },
    },
  }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: 'VibeStream - Creator Coins',
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
          <AuthKitProvider config={farcasterConfig}>
            <SessionProvider refetchInterval={60 * 5}>
              <FarcasterFrameProvider>{children}</FarcasterFrameProvider>
            </SessionProvider>
          </AuthKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}