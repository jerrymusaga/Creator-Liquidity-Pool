import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { EconomyCard } from './EconomyCard'
import { Economy } from '@/types'
import { useStore } from '@/stores/useStore'
import toast from 'react-hot-toast'
import { Search, Filter, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'

interface HomeFeedProps {
  economies: Economy[]
  onEconomySelect: (economy: Economy) => void
}

export const HomeFeed: React.FC<HomeFeedProps> = ({
  economies,
  onEconomySelect,
}) => {
  const { user, addNFT, addTransaction } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'trending' | 'new'>('all')
  const [filteredEconomies, setFilteredEconomies] = useState(economies)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state for demo
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Filter and search economies
  useEffect(() => {
    let result = economies

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (economy) =>
          economy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          economy.creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          economy.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filter
    if (filter === 'trending') {
      result = result.sort((a, b) => b.liquidityPool - a.liquidityPool)
    } else if (filter === 'new') {
      result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

    setFilteredEconomies(result)
  }, [searchQuery, filter, economies])

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
        <span className="animate-spin-slow mr-2">🎉</span>
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

  const handleFilterChange = (newFilter: 'all' | 'trending' | 'new') => {
    setFilter(newFilter)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold mb-4">
          Discover{' '}
          <span className="bg-gradient-vibe bg-clip-text text-transparent">
            Economies
          </span>
        </h1>
        <p className="text-gray-400">
          Join creators, mint NFTs, and earn together!
        </p>
      </motion.div>

      {/* Search and Filter */}
      <Card className="p-4 sticky top-16 z-10 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, economies, or tokens..."
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-vibe-purple focus:outline-none"
              aria-label="Search economies"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'trending' : 'all')}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-1" />
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        </div>
        <div className="flex space-x-2">
          {['all', 'trending', 'new'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleFilterChange(f as 'all' | 'trending' | 'new')}
              className="flex-1"
            >
              {f === 'trending' && <TrendingUp className="w-4 h-4 mr-1" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </Card>

      {/* Economy List */}
      {isLoading ? (
        <Loading />
      ) : filteredEconomies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-lg">
            No economies found. Try a different search or filter!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {filteredEconomies.map((economy, index) => (
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
              {/* Trending Indicator */}
              {filter === 'trending' && index < 3 && (
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