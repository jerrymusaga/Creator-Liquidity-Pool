'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Zap, 
  TrendingUp, 
  Play, 
  Coins, 
  Shield, 
  Globe, 
  Sparkles,
  ChevronDown,
  MessageCircle,
  Wallet,
  Target,
  Rocket
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Welcome } from '@/components/onboarding/Welcome'
import { PersonalizedHomeFeed } from '@/components/home/PersonalizedHomeFeed'
import { EnhancedTrendingFeed } from '@/components/home/EnhancedTrendingFeed'
import { IPFSCoinCreation } from '@/components/creator/IPFSCoinCreation'
import { WalletPage } from '@/components/wallet/WalletPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { useStore } from '@/stores/useStore'
import { useDashboardCoins } from '@/hooks/useZoraCoins'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function Home() {
  const { isConnected, connectWallet } = useWallet()
  const { topVolume, newCoins } = useDashboardCoins()
  const [activeTab, setActiveTab] = useState('home')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true)
  const [showLandingPage, setShowLandingPage] = useState(true)

  // Load Zora data on mount
  useEffect(() => {
    if (isConnected) {
      console.log('Zora data loading...', { topVolume: topVolume.data, newCoins: newCoins.data })
    }
  }, [isConnected, topVolume.data, newCoins.data])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
  }

  const handleCoinSelect = (coinAddress: string) => {
    toast.success(`Exploring coin ${coinAddress}!`, {
      duration: 2000,
      style: {
        background: '#1F2937',
        color: '#F3F4F6',
        border: '1px solid #8B5CF6',
      },
    })
  }

  const handleCoinCreated = () => {
    setActiveTab('home')
    toast.success('Your Creator Coin is live! 🚀', {
      duration: 3000,
      style: {
        background: '#1F2937',
        color: '#F3F4F6',
        border: '1px solid #10B981',
      },
    })
  }

  const handleGetStarted = async () => {
    if (isConnected) {
      // If user is already connected, take them to the personalized home page
      setShowLandingPage(false)
    } else {
      // If user is not connected, connect wallet first
      await connectWallet()
    }
  }

  if (!isOnboardingComplete) {
    return <Welcome onComplete={handleOnboardingComplete} />
  }

  // Show landing page if user is not connected
  if (showLandingPage) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20">
            <div className="absolute inset-0 bg-[url('/vibestreamlogo1.png')] bg-center bg-no-repeat bg-cover opacity-5"></div>
            {/* Floating Elements */}
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
              animate={{
                x: [0, -80, 0],
                y: [0, 60, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center mb-6">
                <img src="/vibestreamlogo1.png" alt="VibeStream" className="h-16 w-16 mr-4" />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  VibeStream
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Where creativity meets crypto. Build, trade, and earn with{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-semibold">
                  Creator Coins
                </span>{' '}
                on Base
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {isConnected ? 'Go to Home' : 'Get Started'}
              </Button>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10 py-4 px-8 rounded-full text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">1000+</div>
                <div className="text-sm text-gray-400">Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">$2M+</div>
                <div className="text-sm text-gray-400">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">50K+</div>
                <div className="text-sm text-gray-400">Holders</div>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-400"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">Why VibeStream?</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The first decentralized platform where creators own their economy and fans invest in their success
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Coins className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Creator Ownership</h3>
                  <p className="text-gray-400">
                    Launch your own ERC-20 tokens with zero platform fees. Keep 100% of direct sales and 50% of trading fees.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-pink-900/20 to-pink-800/20 border-pink-500/20">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Fan Investment</h3>
                  <p className="text-gray-400">
                    Fans can invest in their favorite creators and profit from their success. Build diversified creator portfolios.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Social Trading</h3>
                  <p className="text-gray-400">
                    Trade Creator Coins directly within Farcaster feeds. Native social experience with zero gas fees.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Decentralized</h3>
                  <p className="text-gray-400">
                    Built on Base L2 with IPFS storage. Non-custodial and composable across the entire DeFi ecosystem.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="p-6 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/20">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Auto Rewards</h3>
                  <p className="text-gray-400">
                    Automatic reward distribution via Zora V4. No manual claiming required - earn passively.
                  </p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="p-6 bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/20">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Mobile First</h3>
                  <p className="text-gray-400">
                    Designed for mobile-first creator audiences. Trade anywhere, anytime with seamless UX.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three simple steps to join the creator economy revolution
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Connect Wallet</h3>
                <p className="text-gray-400">
                  Connect your wallet to Base network and start exploring Creator Coins
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Discover Creators</h3>
                <p className="text-gray-400">
                  Find amazing creators, research their coins, and build your portfolio
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Trade & Earn</h3>
                <p className="text-gray-400">
                  Trade Creator Coins and earn alongside your favorite creators
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-4">Ready to Join the Revolution?</h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Connect your wallet and start building your creator economy today. The future of creator monetization is here.
              </p>
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {isConnected ? 'Go to Home' : 'Start Your Journey'}
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/vibestreamlogo1.png" alt="VibeStream" className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">VibeStream</span>
              </div>
              <p className="text-gray-400 mb-4">
                The decentralized creator economy platform built on Base
              </p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Discord
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Farcaster
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Show main app if user is connected
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900"
    >
      <Header />
      
      {/* Add landing page toggle for connected users */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Button
          onClick={() => setShowLandingPage(true)}
          variant="outline"
          className="border-purple-500 text-purple-400 hover:bg-purple-500/10 text-sm"
        >
          View Landing Page
        </Button>
      </div>
      
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-6">
        {activeTab === 'home' && (
          <PersonalizedHomeFeed onCoinSelect={handleCoinSelect} />
        )}
        {activeTab === 'trending' && (
          <EnhancedTrendingFeed onCoinSelect={handleCoinSelect} />
        )}
        {activeTab === 'create' && (
          <IPFSCoinCreation onComplete={handleCoinCreated} />
        )}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  )
}