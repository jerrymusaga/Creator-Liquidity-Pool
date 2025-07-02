export interface User {
  id: string;
  username: string;
  avatar: string;
  isCreator: boolean;
  walletAddress?: string;
  farcasterHandle?: string;
  bio?: string;
  followers?: number;
  following?: number;
  categories?: CreatorCategory[];
  socialLinks?: {
    twitter?: string;
    farcaster?: string;
    website?: string;
  };
  verificationStatus?: 'verified' | 'pending' | 'unverified';
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

export interface CoinHolding {
  coinAddress: string
  coin: CreatorCoin
  balance: number
  averageBuyPrice: number
  currentPrice: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
}

export interface V4Transaction {
  id: string
  type: 'buy' | 'sell' | 'create' | 'reward_distribution'
  timestamp: Date
  coinAddress: string
  coinsAmount: number
  totalValue: number
  creatorReward: number
  tradeReferralReward: number
  user: User
}

export interface CreatorCoin {
  address: string
  symbol: string
  name: string
  image: string
  currentPrice: number
  totalSupply: number
  holderCount: number
  volume24h: number
  creator: User
  coinType: 'creator' | 'content'
  cultureRank?: number
  viralityScore?: number
}

export interface ContentCoin extends CreatorCoin {
  coinType: 'content'
  parentCreatorCoin: string
  parentCreator: User
  viralityScore: number
  properties: {
    contentType: 'video' | 'meme' | 'music' | 'image'
    category: 'content'
  }
  thumbnailURI?: string
}

export interface NFT {
  id: string
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string | number }>
  tokenId: string
  contractAddress: string
  owner: string
}

export interface CreatorCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

export interface CreatorSpotlight {
  creator: User
  coin: CreatorCoin
  reason: string
  spotlightType: 'rising_star' | 'top_performer' | 'new_talent' | 'featured'
  metrics: {
    growthRate: number
    volumeIncrease: number
    holderGrowth: number
  }
}

export interface UserFollow {
  followerId: string
  followingId: string
  createdAt: Date
}

export interface CoinComment {
  id: string
  coinAddress: string
  userId: string
  user: User
  content: string
  createdAt: Date
  likes: number
  replies?: CoinComment[]
  parentId?: string
}