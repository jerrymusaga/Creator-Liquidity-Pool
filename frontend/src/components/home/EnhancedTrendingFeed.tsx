// components/home/EnhancedTrendingFeed.tsx
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, BarChart3, Zap, Users, Clock,
  Filter, ArrowUpRight, ArrowDownLeft, Crown, Target, Flame
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTopVolumeCoins, useTopGainerCoins, useMostValuableCoins } from '@/hooks/useZoraCoins'
import { useWallet } from '@/hooks/useWallet'

interface EnhancedTrendingFeedProps {
  onCoinSelect?: (coinAddress: string) => void
}

type TrendingFilter = 'volume' | 'gainers' | 'market_cap' | 'activity'
type TimeFilter = '1h' | '24h' | '7d' | '30d'

export const EnhancedTrendingFeed: React.FC<EnhancedTrendingFeedProps> = ({ onCoinSelect }) => {
  const { isConnected, networkConfig } = useWallet()
  const [trendingFilter, setTrendingFilter] = useState<TrendingFilter>('volume')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h')

  const { data: volumeCoins, isLoading: loadingVolume } = useTopVolumeCoins({ count: 20 })
  const { data: gainerCoins, isLoading: loadingGainers } = useTopGainerCoins({ count: 20 })
  const { data: marketCapCoins, isLoading: loadingMarketCap } = useMostValuableCoins({ count: 20 })

  const getCurrentData = () => {
    switch (trendingFilter) {
      case 'volume': return volumeCoins || []
      case 'gainers': return gainerCoins || []
      case 'market_cap': return marketCapCoins || []
      case 'activity': return volumeCoins || [] // Could be different metric
      default: return volumeCoins || []
    }
  }

  const getCurrentLoading = () => {
    switch (trendingFilter) {
      case 'volume': return loadingVolume
      case 'gainers': return loadingGainers
      case 'market_cap': return loadingMarketCap
      case 'activity': return loadingVolume
      default: return loadingVolume
    }
  }

  const getFilterIcon = (filter: TrendingFilter) => {
    switch (filter) {
      case 'volume': return BarChart3
      case 'gainers': return TrendingUp
      case 'market_cap': return Target
      case 'activity': return Zap
      default: return BarChart3
    }
  }

  const getFilterLabel = (filter: TrendingFilter) => {
    switch (filter) {
      case 'volume': return 'Volume Leaders'
      case 'gainers': return 'Top Gainers'
      case 'market_cap': return 'Market Cap'
      case 'activity': return 'Most Active'
      default: return 'Volume'
    }
  }

  const coins = getCurrentData()
  const isLoading = getCurrentLoading()

  // Calculate trending stats
  const totalVolume = coins.reduce((sum: number, coin: any) => sum + (parseFloat(coin.volume24h) || 0), 0)
  const avgGrowth = coins.length > 0 
    ? coins.reduce((sum: number, coin: any) => sum + (Math.random() * 50 - 10), 0) / coins.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
          <Flame className="w-8 h-8 text-orange-400 mr-3" />
          Trending{' '}
          <span className="bg-gradient-vibe bg-clip-text text-transparent ml-2">
            Now
          </span>
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          Live rankings of the hottest Creator Coins on {networkConfig.name}
        </p>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-md mx-auto mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-vibe-purple">{coins.length}</p>
            <p className="text-sm text-gray-400">Trending Coins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-vibe-green">
              ${(totalVolume / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-gray-400">Total Volume</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${avgGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {avgGrowth >= 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400">Avg Growth</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4"
      >
        {/* Trending Type Filters */}
        <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-xl">
          {(['volume', 'gainers', 'market_cap', 'activity'] as TrendingFilter[]).map((filter) => {
            const Icon = getFilterIcon(filter)
            return (
              <button
                key={filter}
                onClick={() => setTrendingFilter(filter)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  trendingFilter === filter
                    ? 'bg-vibe-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {getFilterLabel(filter)}
              </button>
            )
          })}
        </div>

        {/* Time Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex bg-gray-800 p-1 rounded-lg">
            {(['1h', '24h', '7d', '30d'] as TimeFilter[]).map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeFilter === time
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trending List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-700 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {coins.map((coin: any, index: number) => (
              <TrendingCoinCard
                key={coin.address || index}
                coin={coin}
                rank={index + 1}
                onSelect={onCoinSelect}
                filterType={trendingFilter}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Individual Trending Coin Card
const TrendingCoinCard: React.FC<{
  coin: any
  rank: number
  onSelect?: (address: string) => void
  filterType: TrendingFilter
}> = ({ coin, rank, onSelect, filterType }) => {
  // Mock some additional data
  const priceChange = (Math.random() - 0.3) * 100 // -30% to +70%
  const isPositive = priceChange >= 0
  const volume24h = parseFloat(coin.volume24h) || Math.random() * 100000
  const marketCap = volume24h * 50 // Rough estimate
  
  const getRankBadgeColor = () => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
    if (rank <= 10) return 'bg-gradient-to-r from-gray-400 to-gray-600'
    return 'bg-gray-700'
  }

  const getMainMetric = () => {
    switch (filterType) {
      case 'volume': 
        return {
          value: `$${(volume24h / 1000).toFixed(0)}K`,
          label: 'Volume 24h',
          color: 'text-vibe-blue'
        }
      case 'gainers':
        return {
          value: `${isPositive ? '+' : ''}${priceChange.toFixed(1)}%`,
          label: '24h Change',
          color: isPositive ? 'text-green-400' : 'text-red-400'
        }
      case 'market_cap':
        return {
          value: `$${(marketCap / 1000000).toFixed(1)}M`,
          label: 'Market Cap',
          color: 'text-vibe-purple'
        }
      case 'activity':
        return {
          value: `${coin.holderCount || Math.floor(Math.random() * 500) + 50}`,
          label: 'Holders',
          color: 'text-vibe-green'
        }
      default:
        return {
          value: `$${(volume24h / 1000).toFixed(0)}K`,
          label: 'Volume',
          color: 'text-vibe-blue'
        }
    }
  }

  const mainMetric = getMainMetric()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Card className={`p-4 hover:border-vibe-purple transition-all ${rank <= 3 ? 'neon-border' : ''}`}>
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRankBadgeColor()}`}>
            {rank <= 3 ? <Crown className="w-4 h-4" /> : rank}
          </div>

          {/* Coin Info */}
          <div className="flex items-center space-x-3 flex-1">
            <img
              src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
              alt={coin.name || 'Coin'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-bold text-lg">{coin.symbol || 'UNKNOWN'}</h3>
              <p className="text-sm text-gray-400">{coin.name || 'Unknown Coin'}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {coin.holderCount || 0} holders
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor(Math.random() * 24) + 1}h ago
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-bold text-lg">${(coin.currentPrice || Math.random() * 0.1).toFixed(4)}</p>
            <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}{priceChange.toFixed(1)}%
            </div>
          </div>

          {/* Main Metric */}
          <div className="text-right min-w-[80px]">
            <p className={`font-bold text-lg ${mainMetric.color}`}>
              {mainMetric.value}
            </p>
            <p className="text-xs text-gray-400">{mainMetric.label}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => onSelect?.(coin.address)}
              size="sm"
              variant="outline"
              className="min-w-[80px]"
            >
              View
            </Button>
            <Button
              size="sm"
              className="min-w-[80px]"
            >
              <ArrowUpRight className="w-3 h-3 mr-1" />
              Buy
            </Button>
          </div>
        </div>

        {/* Trending indicator for top coins */}
        {rank <= 5 && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center text-orange-400">
                <Flame className="w-3 h-3 mr-1" />
                Trending #{rank}
              </span>
              <span className="text-gray-400">
                {filterType === 'volume' && 'High volume activity'}
                {filterType === 'gainers' && 'Strong price momentum'}
                {filterType === 'market_cap' && 'Large market presence'}
                {filterType === 'activity' && 'Active community'}
              </span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}