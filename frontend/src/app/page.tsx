'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Navigation } from '@/components/layout/Navigation'
import { Welcome } from '@/components/onboarding/Welcome'
import { LiveCoinsFeed } from '@/components/home/LiveCoinsFeeds'
import { TrendingFeed } from '@/components/home/TrendingFeed'
import { RealCreateEconomy } from '@/components/creator/RealCreateEconomy'
import { WalletPage } from '@/components/wallet/WalletPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { useStore } from '@/stores/useStore'
import { Economy } from '@/types'
import { mockEconomies } from '@/lib/mockData'
import toast from 'react-hot-toast'

export default function Home() {
  const { user, setEconomies } = useStore()
  const [activeTab, setActiveTab] = useState('home')
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(!!user)
  const router = useRouter()

  useEffect(() => {
    // Mock fetching economies
    setEconomies(mockEconomies)
  }, [setEconomies])

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
  }

  const handleEconomySelect = (economy: Economy) => {
    router.push(`/economy/${economy.id}`)
    toast.success(`Exploring ${economy.name}!`, {
      duration: 2000,
      style: {
        background: '#1F2937',
        color: '#F3F4F6',
        border: '1px solid #8B5CF6',
      },
    })
  }

  const handleEconomyCreated = () => {
    setActiveTab('home')
    toast.success('Your Vibe is live! Share it now!', {
      duration: 3000,
      style: {
        background: '#1F2937',
        color: '#F3F4F6',
        border: '1px solid #8B5CF6',
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
          <LiveCoinsFeed
            onCoinSelect={(coinAddress: string) => {
              const economy = mockEconomies.find(e => e.id === coinAddress)
              if (economy) {
                handleEconomySelect(economy)
              } else {
                toast.error('Economy not found!')
              }
            }}
          />
        )}
        {activeTab === 'trending' && (
          <TrendingFeed
            economies={mockEconomies}
            onEconomySelect={handleEconomySelect}
          />
        )}
        {activeTab === 'create' && (
          <RealCreateEconomy onComplete={handleEconomyCreated} />
        )}
        {activeTab === 'wallet' && <WalletPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  )
}