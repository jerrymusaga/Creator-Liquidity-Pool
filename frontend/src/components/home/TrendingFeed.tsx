'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EconomyCard } from './EconomyCard'
import { Economy } from '@/types'
import { useStore } from '@/stores/useStore'
import toast from 'react-hot-toast'
import { TrendingUp } from 'lucide-react'
import { Loading } from '@/components/ui/Loading'

interface TrendingFeedProps {
  economies: Economy[]
  onEconomySelect: (economy: Economy) => void
}

export const TrendingFeed: React.FC<TrendingFeedProps> = ({
  economies,
  onEconomySelect,
}) => {
  const { user, addNFT, addTransaction } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [trendingEconomies, setTrendingEconomies] = useState<Economy[]>([])

  // Sort economies by liquidity pool for trending
  useEffect(() => {
    setIsLoading(true)
    const sorted = [...economies].sort((a, b) => b.liquidityPool - a.liquidityPool)
    setTrendingEconomies(sorted)
    const timer = setTimeout(() => setIsLoading(false), 1000) // Mock loading
    return () => clearTimeout(timer)
  }, [economies])

  const handleMint = (economy: Economy) => {
    if (!user) {
      toast.error('Please login first!')
      return
    }

    const newNFT = {
      id: Date.now().toString(),
      economyId: economy.id,
      title: `${economy.name} #${economy.nftsMinted + 1}`,
      description: economy.description,
      image: economy.image,
      owner: user.username,
      mintedAt: new Date(),
    }

    const transaction = {
      id: Date.now().toString(),
      type: 'mint' as const,
      userId: user.id,
      economyId: economy.id,
      amount: 1,
      tokenSymbol: 'NFT',
      timestamp: new Date(),
    }

    addNFT(newNFT)
    addTransaction(transaction)

    toast.success(
      <div className="flex items-center">
        <span className="animate-spin-slow mr-2">🔥</span>
        You minted {economy.name}!
      </div>,
      {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#F3F4F6',
          border: '1px solid #8B5CF6',
        },
      }
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
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-vibe-pink mr-2" />
          Top{' '}
          <span className="bg-gradient-vibe bg-clip-text text-transparent">
            Vibes
          </span>
        </h1>
        <p className="text-gray-400">
          Discover the hottest creator economies!
        </p>
      </motion.div>

      {isLoading ? (
        <Loading />
      ) : trendingEconomies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">
            No trending economies yet. Check back soon!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {trendingEconomies.map((economy, index) => (
            <motion.div
              key={economy.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <EconomyCard
                economy={economy}
                onMint={() => handleMint(economy)}
                onJoin={() => handleJoin(economy)}
              />
              {index < 3 && (
                <div className="flex items-center justify-center mt-2">
                  <TrendingUp className="w-4 h-4 text-vibe-pink mr-1" />
                  <span className="text-sm text-vibe-pink font-semibold">
                    Top {index + 1} Trending
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}