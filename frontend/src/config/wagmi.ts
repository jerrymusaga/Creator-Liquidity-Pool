import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import farcasterFrame from "@farcaster/frame-wagmi-connector";
import { 
  connectorsForWallets 
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
  trustWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { SUPPORTED_CHAINS } from "./networks";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: "More", 
      wallets: [
        rainbowWallet,
        trustWallet,
        injectedWallet,
      ],
    },
  ],
  {
    appName: "VibeStream - Creator Coins",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6", // fallback project id
  }
);

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    farcasterFrame(),
    ...connectors,
  ],
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"
    ),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
    ),
  },
});

// RainbowKit theme configuration
export const rainbowKitTheme = {
  blurs: {
    modalOverlay: 'blur(4px)',
  },
  colors: {
    accentColor: '#8B5CF6', // vibe-purple
    accentColorForeground: '#FFFFFF',
    actionButtonBorder: 'rgba(139, 92, 246, 0.2)',
    actionButtonBorderMobile: 'rgba(139, 92, 246, 0.2)',
    actionButtonSecondaryBackground: 'rgba(139, 92, 246, 0.1)',
    closeButton: '#9CA3AF',
    closeButtonBackground: 'rgba(31, 41, 55, 0.8)',
    connectButtonBackground: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    connectButtonBackgroundError: '#EF4444',
    connectButtonInnerBackground: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    connectButtonText: '#FFFFFF',
    connectButtonTextError: '#FFFFFF',
    connectionIndicator: '#10B981',
    downloadBottomCardBackground: 'linear-gradient(126deg, rgba(139, 92, 246, 0.1) 9.49%, rgba(236, 72, 153, 0.1) 71.04%)',
    downloadTopCardBackground: 'linear-gradient(126deg, rgba(139, 92, 246, 0.2) 9.49%, rgba(236, 72, 153, 0.2) 71.04%)',
    error: '#EF4444',
    generalBorder: 'rgba(55, 65, 81, 0.6)',
    generalBorderDim: 'rgba(55, 65, 81, 0.3)',
    menuItemBackground: 'rgba(31, 41, 55, 0.8)',
    modalBackdrop: 'rgba(0, 0, 0, 0.8)',
    modalBackground: '#1F2937',
    modalBorder: 'rgba(139, 92, 246, 0.2)',
    modalText: '#F3F4F6',
    modalTextDim: '#9CA3AF',
    modalTextSecondary: '#D1D5DB',
    profileAction: 'rgba(31, 41, 55, 0.8)',
    profileActionHover: 'rgba(55, 65, 81, 0.8)',
    profileForeground: 'rgba(31, 41, 55, 0.9)',
    selectedOptionBorder: 'rgba(139, 92, 246, 0.4)',
    standby: '#F59E0B',
  },
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '999px',
    menuButton: '12px',
    modal: '16px',
    modalMobile: '16px',
  },
  shadows: {
    connectButton: '0 4px 12px rgba(139, 92, 246, 0.3)',
    dialog: '0 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0 2px 6px rgba(0, 0, 0, 0.15)',
    selectedOption: '0 2px 6px rgba(139, 92, 246, 0.2)',
    selectedWallet: '0 2px 6px rgba(139, 92, 246, 0.2)',
    walletLogo: '0 2px 16px rgba(0, 0, 0, 0.16)',
  },
};