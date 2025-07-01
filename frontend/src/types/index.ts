export interface User {
  id: string;
  username: string;
  avatar: string;
  isCreator: boolean;
  walletAddress?: string;
}

export interface Economy {
  creatorCoin: any;
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
  type: 'mint' | 'trade' | 'invest' | 'reward';
  userId: string;
  economyId: string;
  amount: number;
  tokenSymbol: string;
  timestamp: Date;
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