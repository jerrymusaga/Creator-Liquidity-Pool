
import { base, baseSepolia } from "wagmi/chains";

export const CURRENT_NETWORK = baseSepolia; // Change to baseSepolia for testnet
export const NETWORK_CONFIG = {
  [base.id]: {
    chain: base,
    name: "Base Mainnet",
    rpcUrl: "https://mainnet.base.org",
    explorerUrl: "https://basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    zoraFactory: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
  },
  [baseSepolia.id]: {
    chain: baseSepolia,
    name: "Base Sepolia Testnet", 
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH", 
      decimals: 18,
    },
    zoraFactory: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
  },
};

export const getCurrentNetworkConfig = () => {
  return NETWORK_CONFIG[CURRENT_NETWORK.id];
};

export const isCorrectNetwork = (chainId?: number) => {
  return chainId === CURRENT_NETWORK.id;
};

export const SUPPORTED_CHAINS = [base, baseSepolia] as const;