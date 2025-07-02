'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Welcome } from '@/components/onboarding/Welcome'
import HomeFeed  from '@/components/home/HomeFeed'
import { TrendingFeed } from '@/components/home/TrendingFeed'
import { CreatorCoinFrame } from '@/components/creator/RealCreateEconomy'
import { WalletPage } from '@/components/wallet/WalletPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { useStore } from '@/stores/useStore'
import { Economy } from '@/types'
import { mockEconomies } from '@/lib/mockData'
import toast from 'react-hot-toast'
import { Zap, Crown, FireExtinguisher } from 'lucide-react'

export default function Home() {
  const { user, setEconomies } = useStore()
  const [activeTab, setActiveTab] = useState('home')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(!!user)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate loading app data
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Set mock economies with enhanced V4 data
        const enhancedEconomies = mockEconomies.map((economy, index) => ({
          ...economy,
          cultureScore: 1000 - (index * 100), // Ranking scores
          cultureRank: index + 1,
          creatorCoin: {
            ...economy.creatorCoin,
            version: 'v4' as const,
            volume24h: Math.random() * 10000 + 1000,
            priceChange24h: (Math.random() - 0.5) * 40, // -20% to +20%
            holderCount: Math.floor(Math.random() * 500) + 50,
            marketCap: economy.creatorCoin.currentPrice * economy.creatorCoin.totalSupply,
            properties: {
              category: 'social' as const,
              creatorType: index % 2 === 0 ? 'gaming' : 'content' as any,
              socialLinks: {
                farcaster: `@${economy.creator.username.toLowerCase()}`,
                twitter: `@${economy.creator.username.toLowerCase()}`
              }
            }
          },
          contentCoins: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
            address: `0x${Math.random().toString(16).slice(2, 42)}`,
            name: `${economy.creator.username}'s ${['Epic Win', 'Viral Moment', 'Behind Scenes', 'Tutorial', 'Collab'][i]} #${i + 1}`,
            symbol: `${economy.creatorCoin.symbol}_${String(i + 1).padStart(3, '0')}`,
            coinType: 'content' as const,
            parentCreatorCoin: economy.creatorCoin.address,
            parentCreator: economy.creator,
            creator: economy.creator,
            description: `Exclusive content from ${economy.creator.username}`,
            image: economy.creatorCoin.image,
            thumbnailURI: economy.creatorCoin.image,
            uri: `ipfs://content-${i}`,
            currentPrice: Math.random() * 0.01 + 0.001,
            priceChange24h: (Math.random() - 0.5) * 60,
            volume24h: Math.random() * 1000 + 100,
            holderCount: Math.floor(Math.random() * 100) + 10,
            viralityScore: Math.floor(Math.random() * 100) + 1,
            speculationSentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as any,
            momentum: Math.floor(Math.random() * 100),
            properties: {
              category: 'content' as const,
              contentType: ['video', 'meme', 'music', 'image'][Math.floor(Math.random() * 4)] as any,
              parentCoin: economy.creatorCoin.address,
              timestamp: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000 // Last 7 days
            },
            contentURI: `ipfs://content-${i}`,
            mimeType: 'video/mp4',
            payoutSwapPath: {
              currencyIn: `0x${Math.random().toString(16).slice(2, 42)}`,
              path: [economy.creatorCoin.address, '0xZORA_ADDRESS']
            },
            totalSupply: 10000,
            marketCap: 0,
            avgHoldingTime: 0,
            uniqueTraders24h: 0,
            payoutRecipient: economy.creator.walletAddress!,
            platformReferrer: 'CLP_PLATFORM',
            currency: economy.creatorCoin.address,
            poolKey: {} as any,
            poolKeyHash: '',
            version: 'v4' as const,
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            lastTradeAt: new Date()
          }))
        }))

        setEconomies(enhancedEconomies)
        setIsLoading(false)

        // Show welcome message for returning users
        if (user) {
          toast.success(
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-vibe-purple" />
              <span>Welcome back to Vibe! V4 rewards are live 🚀</span>
            </div>,
            { duration: 3000 }
          )
        }

      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [setEconomies, user])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
    toast.success(
      <div className="flex items-center">
        <Crown className="w-5 h-5 mr-2 text-vibe-purple" />
        <div>
          <p className="font-semibold">Welcome to Vibe! 🎉</p>
          <p className="text-xs text-gray-400">Start trading Creator Coins with V4 rewards</p>
        </div>
      </div>,
      { duration: 4000 }
    )
  }

  const handleEconomySelect = (economy: Economy) => {
    router.push(`/economy/${economy.id}`)
    toast.success(
      <div className="flex items-center">
        <FireExtinguisher className="w-5 h-5 mr-2 text-vibe-pink" />
        <span>Exploring {economy.creator.username}'s economy!</span>
      </div>,
      { duration: 2000 }
    )
  }

  const handleEconomyCreated = () => {
    setActiveTab('home')
    toast.success(
      <div className="flex items-center">
        <Zap className="w-5 h-5 mr-2 text-vibe-green" />
        <div>
          <p className="font-semibold">Your Creator Coin is live! 🚀</p>
          <p className="text-xs text-gray-400">V4 auto rewards activated • Share on Farcaster</p>
        </div>
      </div>,
      { duration: 5000 }
    )
  }

  // Show onboarding if user hasn't completed it
  if (!isOnboardingComplete) {
    return <Welcome onComplete={handleOnboardingComplete} />
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-16 h-16 bg-gradient-vibe rounded-full flex items-center justify-center"
        >
          <span className="text-white font-bold text-2xl">V</span>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white"
    >
      {/* Header - Only show on certain tabs */}
      {!['create', 'wallet', 'profile'].includes(activeTab) && <Header />}
      
      {/* Main Content */}
      <main className="pb-20"> {/* Bottom padding for navigation */}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomeFeed
                economies={mockEconomies}
                onEconomySelect={handleEconomySelect}
              />
            </motion.div>
          )}

          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TrendingFeed
                economies={mockEconomies}
                onEconomySelect={handleEconomySelect}
              />
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CreatorCoinFrame onComplete={handleEconomyCreated} />
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <WalletPage />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfilePage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  )
}