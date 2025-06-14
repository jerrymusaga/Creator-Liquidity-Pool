// package.json
{
  "name": "vibe-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "lucide-react": "^0.263.0",
    "framer-motion": "^10.16.0",
    "react-hot-toast": "^2.4.1",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vibe-purple': '#8B5CF6',
        'vibe-blue': '#3B82F6',
        'vibe-pink': '#EC4899',
        'vibe-green': '#10B981',
        'vibe-orange': '#F59E0B',
      },
      backgroundImage: {
        'gradient-vibe': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig

// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vibe - Creators and Fans Earn Together',
  description: 'Join creator economies, mint NFTs, and earn tokens in the ultimate social app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1F2937',
              color: '#F3F4F6',
              border: '1px solid #8B5CF6',
            },
          }}
        />
      </body>
    </html>
  )
}

// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply bg-gray-900 text-white;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-vibe hover:opacity-90 text-white font-bold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105;
  }
  
  .btn-secondary {
    @apply bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-vibe-purple transition-colors duration-200;
  }
  
  .neon-border {
    @apply border-2 border-vibe-purple shadow-lg shadow-vibe-purple/50;
  }
  
  .neon-glow {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }
}

// types/index.ts
export interface User {
  id: string;
  username: string;
  avatar: string;
  isCreator: boolean;
  walletAddress?: string;
}

export interface Economy {
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

export interface NFT {
  id: string;
  economyId: string;
  title: string;
  description: string;
  image: string;
  owner: string;
  mintedAt: Date;
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

// stores/useStore.ts
import { create } from 'zustand'
import { User, Economy, NFT, Transaction } from '@/types'

interface AppState {
  user: User | null;
  economies: Economy[];
  userNFTs: NFT[];
  transactions: Transaction[];
  selectedEconomy: Economy | null;
  
  // Actions
  setUser: (user: User) => void;
  setEconomies: (economies: Economy[]) => void;
  setSelectedEconomy: (economy: Economy | null) => void;
  addTransaction: (transaction: Transaction) => void;
  addNFT: (nft: NFT) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  economies: [],
  userNFTs: [],
  transactions: [],
  selectedEconomy: null,
  
  setUser: (user) => set({ user }),
  setEconomies: (economies) => set({ economies }),
  setSelectedEconomy: (economy) => set({ selectedEconomy: economy }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  addNFT: (nft) => set((state) => ({ 
    userNFTs: [nft, ...state.userNFTs] 
  })),
}))

// lib/mockData.ts
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

// components/ui/Button.tsx
import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-bold rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-vibe-purple focus:ring-opacity-50'
  
  const variantClasses = {
    primary: 'bg-gradient-vibe hover:opacity-90 text-white',
    secondary: 'bg-gray-800 hover:bg-gray-700 text-white',
    outline: 'border-2 border-vibe-purple text-vibe-purple hover:bg-vibe-purple hover:text-white'
  }
  
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}

// components/ui/Card.tsx
import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  neonBorder?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  neonBorder = false
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`
        bg-gray-800 border border-gray-700 rounded-xl p-6 
        ${hover ? 'hover:border-vibe-purple transition-colors duration-200' : ''}
        ${neonBorder ? 'neon-border neon-glow' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// components/ui/Loading.tsx
import React from 'react'
import { motion } from 'framer-motion'

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-vibe-purple border-t-transparent rounded-full"
      />
    </div>
  )
}

// components/layout/Header.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Menu } from 'lucide-react'
import { useStore } from '@/stores/useStore'

export const Header: React.FC = () => {
  const { user } = useStore()

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-vibe rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl animate-pulse-slow">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
              Vibe
            </span>
          </motion.div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.username}</span>
              </div>
            ) : (
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </button>
            )}
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

// components/layout/Navigation.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Home, TrendingUp, Wallet, User, Plus } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-vibe-purple bg-vibe-purple/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// components/onboarding/Welcome.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
import { mockUsers } from '@/lib/mockData'

interface WelcomeProps {
  onComplete: () => void
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState<'creator' | 'fan' | null>(null)
  const { setUser } = useStore()

  const handleUserTypeSelect = (type: 'creator' | 'fan') => {
    setUserType(type)
    setStep(1)
  }

  const handleLogin = () => {
    // Mock login - in real app, this would handle Farcaster/Web3Auth
    const mockUser = type === 'creator' ? mockUsers[0] : mockUsers[1]
    setUser(mockUser)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Logo Animation */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-vibe rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <span className="text-white font-bold text-4xl">V</span>
            </motion.div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-vibe bg-clip-text text-transparent">
              Vibe
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Creators and fans earn together!
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => handleUserTypeSelect('creator')}
                className="w-full"
                size="lg"
              >
                I'm a Creator 🎨
              </Button>
              <Button
                onClick={() => handleUserTypeSelect('fan')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                I'm a Fan 💫
              </Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              {userType === 'creator' ? 'Welcome, Creator!' : 'Welcome, Fan!'}
            </h2>
            <p className="text-gray-300 mb-8">
              {userType === 'creator' 
                ? 'Launch your economy and earn from your content'
                : 'Support creators and earn rewards together'
              }
            </p>

            <div className="bg-gray-800 p-6 rounded-xl mb-8">
              <h3 className="font-semibold mb-4">Quick Setup</h3>
              <p className="text-sm text-gray-400">
                Sign in with your Farcaster account for instant access
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full mb-4"
              size="lg"
            >
              Continue with Farcaster
            </Button>
            
            <button
              onClick={() => setStep(0)}
              className="text-vibe-purple hover:underline"
            >
              Back
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// components/home/EconomyCard.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Play, Coins, Users, TrendingUp } from 'lucide-react'
import { Economy } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface EconomyCardProps {
  economy: Economy
  onMint: (economy: Economy) => void
  onJoin: (economy: Economy) => void
}

export const EconomyCard: React.FC<EconomyCardProps> = ({
  economy,
  onMint,
  onJoin
}) => {
  return (
    <Card className="relative overflow-hidden mb-6" neonBorder>
      {/* Video/Image */}
      <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
        <img
          src={economy.image}
          alt={economy.name}
          className="w-full h-full object-cover"
        />
        {economy.video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Creator Info */}
        <div className="flex items-center space-x-3">
          <img
            src={economy.creator.avatar}
            alt={economy.creator.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{economy.creator.username}</h3>
            <p className="text-sm text-gray-400">Creator</p>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-xl font-bold mb-2">{economy.name}</h2>
          <p className="text-gray-300 text-sm">{economy.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Coins className="w-4 h-4 text-vibe-purple mr-1" />
              <span className="text-xs text-gray-400">Price</span>
            </div>
            <p className="font-semibold">${economy.currentPrice}</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-vibe-blue mr-1" />
              <span className="text-xs text-gray-400">NFTs</span>
            </div>
            <p className="font-semibold">{economy.nftsMinted}</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-vibe-green mr-1" />
              <span className="text-xs text-gray-400">Pool</span>
            </div>
            <p className="font-semibold">${economy.liquidityPool}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={() => onMint(economy)}
            size="sm"
            className="flex-1"
          >
            Mint Free
          </Button>
          <Button
            onClick={() => onJoin(economy)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Join Vibe
          </Button>
        </div>
      </div>
    </Card>
  )
}

// components/home/HomeFeed.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { EconomyCard } from './EconomyCard'
import { Economy } from '@/types'
import { useStore } from '@/stores/useStore'
import toast from 'react-hot-toast'

interface HomeFeedProps {
  economies: Economy[]
  onEconomySelect: (economy: Economy) => void
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  economies,
  onEconomySelect
}) => {
  const { user, addNFT, addTransaction } = useStore()

  const handleMint = (economy: Economy) => {
    if (!user) {
      toast.error('Please login first!')
      return
    }

    // Mock minting
    const newNFT = {
      id: Date.now().toString(),
      economyId: economy.id,
      title: `${economy.name} #${economy.nftsMinted + 1}`,
      description: economy.description,
      image: economy.image,
      owner: user.username,
      mintedAt: new Date()
    }

    const transaction = {
      id: Date.now().toString(),
      type: 'mint' as const,
      userId: user.id,
      economyId: economy.id,
      amount: 1,
      tokenSymbol: 'NFT',
      timestamp: new Date()
    }

    addNFT(newNFT)
    addTransaction(transaction)
    
    toast.success(
      <div className="flex items-center">
        <span className="animate-spin-slow mr-2">🎉</span>
        You minted {economy.name}!
      </div>
    )
  }

  const handleJoin = (economy: Economy) => {
    onEconomySelect(economy)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold mb-4">
          Discover <span className="bg-gradient-vibe bg-clip-text text-transparent">Economies</span>
        </h1>
        <p className="text-gray-400">
          Join creators, mint NFTs, and earn together!
        </p>
      </motion.div>

      <div className="space-y-6">
        {economies.map((economy, index) => (
          <motion.div
            key={economy.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <EconomyCard
              economy={economy}
              onMint={