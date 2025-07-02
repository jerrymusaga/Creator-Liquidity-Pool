'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Welcome } from '@/components/onboarding/Welcome'
import { PersonalizedHomeFeed } from '@/components/home/PersonalizedHomeFeed'
import { EnhancedTrendingFeed } from '@/components/home/EnhancedTrendingFeed'
import { RealCreateEconomy } from '@/components/creator/RealCreateEconomy'
import { WalletPage } from '@/components/wallet/WalletPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { useStore } from '@/stores/useStore'
import { useDashboardCoins } from '@/hooks/useZoraCoins'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

export default function Home() {
  const { user } = useStore()
  const { isConnected } = useWallet()
  const { topVolume, newCoins, isLoading } = useDashboardCoins()
  const [activeTab, setActiveTab] = useState('home')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true) // Skip onboarding for now
  const router = useRouter()

  // Load Zora data on mount
  useEffect(() => {
    if (isConnected) {
      // Data is automatically loaded by the hooks
      console.log('Zora data loading...', { topVolume: topVolume.data, newCoins: newCoins.data })
    }
  }, [isConnected, topVolume.data, newCoins.data])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
  }

  const handleCoinSelect = (coinAddress: string) => {
    // Navigate to coin detail page or show coin info
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

  if (!isOnboardingComplete) {
    return <Welcome onComplete={handleOnboardingComplete} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900"
    >
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <PersonalizedHomeFeed onCoinSelect={handleCoinSelect} />
        )}
        {activeTab === 'trending' && (
          <EnhancedTrendingFeed onCoinSelect={handleCoinSelect} />
        )}
        {activeTab === 'create' && (
          <RealCreateEconomy onComplete={handleCoinCreated} />
        )}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  )
}