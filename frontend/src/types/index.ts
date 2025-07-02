export interface User {
  id: string;
  username: string;
  avatar: string;
  isCreator: boolean;
  walletAddress?: string;
  farcasterHandle?: string;
}

export interface ZoraCoin {
  address: string
  name: string
  symbol: string
  description: string
  image: string
  totalSupply: string
  marketCap: string
  volume24h: string
  holderCount: number
  currentPrice: string
  priceChange24h: number
  creator: {
    address: string
    username: string
    avatar: string
  }
  createdAt: string
}

export interface Economy {
  creatorCoin: any;
  contentCoins: any[];
  id: string;
  creator: User;
  name: string;
  tokenSymbol: string;
  description: string;
  image: string;
  video?: string;
  totalSupply: number;
  currentPrice: number;
  liquidityPool: number;
  nftsMinted: number;
  totalEarnings: number;
  createdAt: Date;
}


export interface Transaction {
  id: string;
  type: 'mint' | 'trade' | 'invest' | 'reward' | 'buy' | 'sell' | 'create' | 'reward_distribution';
  userId: string;
  economyId: string;
  amount: number;
  tokenSymbol: string;
  timestamp: Date;
  tradeReferralReward?: number;
  creatorReward?: number;
  coinsAmount?: number;
  totalValue?: number;
}

export interface Perk {
  id: string;
  economyId: string;
  title: string;
  description: string;
  cost: number;
  available: boolean;
  icon: string;
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number
}