import { Economy, User, NFT, Perk } from '@/types'

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'JakeTheGamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    isCreator: true,
    walletAddress: '0x1234...5678'
  },
  {
    id: '2',
    username: 'Sarah_Fortnite',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612822b?w=150&h=150&fit=crop&crop=face',
    isCreator: false
  }
]

export const mockEconomies: Economy[] = [
  {
    id: '1',
    creator: mockUsers[0],
    name: 'Epic Fortnite Win',
    tokenSymbol: 'JAKE',
    description: 'Join my gaming crew and earn rewards!',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
    video: 'https://example.com/jake-fortnite.mp4',
    totalSupply: 1000000,
    currentPrice: 0.005,
    liquidityPool: 2500,
    nftsMinted: 150,
    totalEarnings: 125.50,
    createdAt: new Date('2024-06-10')
  },
  {
    id: '2',
    creator: {
      id: '3',
      username: 'MusicMaven',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      isCreator: true
    },
    name: 'Beats & Vibes',
    tokenSymbol: 'BEATS',
    description: 'Support my music journey!',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    totalSupply: 500000,
    currentPrice: 0.008,
    liquidityPool: 1200,
    nftsMinted: 89,
    totalEarnings: 67.30,
    createdAt: new Date('2024-06-08')
  }
]

export const mockNFTs: NFT[] = [
  {
    id: '1',
    economyId: '1',
    title: 'Victory Royale #1',
    description: 'Epic gaming moment!',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=300&fit=crop',
    owner: 'sarah_fortnite',
    mintedAt: new Date('2024-06-12')
  }
]

export const mockPerks: Perk[] = [
  {
    id: '1',
    economyId: '1',
    title: 'Discord Shoutout',
    description: 'Get featured in Jake\'s Discord!',
    cost: 50,
    available: true,
    icon: '📢'
  },
  {
    id: '2',
    economyId: '1',
    title: 'Gaming Session',
    description: 'Play Fortnite with Jake!',
    cost: 200,
    available: true,
    icon: '🎮'
  },
  {
    id: '3',
    economyId: '1',
    title: 'Exclusive NFT',
    description: 'Limited edition collectible',
    cost: 100,
    available: false,
    icon: '🎨'
  }
]