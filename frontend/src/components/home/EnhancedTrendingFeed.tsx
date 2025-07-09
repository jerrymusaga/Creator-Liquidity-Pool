'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, BarChart3, Zap, Users, Clock,
  Filter, ArrowUpRight, Crown, Target, Flame, Eye,
  Sparkles, ExternalLink
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EnhancedShareButton } from '@/components/ui/EnhancedShareButton'
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
      case 'activity': return volumeCoins || []
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

  // Calculate real trending stats (no mock data)
  const totalVolume = coins.reduce((sum: number, coin: any) => sum + (parseFloat(coin.volume24h) || 0), 0)
  const avgPrice = coins.length > 0 
    ? coins.reduce((sum: number, coin: any) => sum + (parseFloat(coin.currentPrice) || 0), 0) / coins.length 
    : 0

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4 sm:py-8 px-2"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 flex items-center justify-center">
          <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mr-2 sm:mr-3" />
          <span className="flex flex-col sm:flex-row items-center">
            <span>Trending</span>
            <span className="bg-gradient-vibe bg-clip-text text-transparent sm:ml-2">
              Now
            </span>
          </span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto">
          Live rankings of the hottest Creator Coins on {networkConfig.name}
        </p>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-6">
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
            <p className="text-2xl font-bold text-vibe-blue">
              ${avgPrice.toFixed(4)}
            </p>
            <p className="text-sm text-gray-400">Avg Price</p>
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

// Individual Trending Coin Card with Enhanced Share Button
const TrendingCoinCard: React.FC<{
  coin: any
  rank: number
  onSelect?: (address: string) => void
  filterType: TrendingFilter
}> = ({ coin, rank, onSelect, filterType }) => {
  
  // Use real data only - no mock data
  const volume24h = parseFloat(coin.volume24h) || 0
  const marketCap = parseFloat(coin.marketCap) || 0
  const currentPrice = parseFloat(coin.currentPrice) || 0
  const priceChange24h = parseFloat(coin.priceChange24h) || 0
  const isPositive = priceChange24h >= 0
  
  const getRankBadgeColor = () => {
    if (rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-orange-500'
    if (rank <= 10) return 'bg-gradient-to-r from-gray-400 to-gray-600'
    return 'bg-gray-700'
  }

  const getMainMetric = () => {
    switch (filterType) {
      case 'volume': 
        return {
          value: volume24h > 0 ? `$${(volume24h / 1000).toFixed(0)}K` : 'N/A',
          label: 'Volume 24h',
          color: 'text-vibe-blue'
        }
      case 'gainers':
        return {
          value: priceChange24h !== 0 ? `${isPositive ? '+' : ''}${priceChange24h.toFixed(1)}%` : 'N/A',
          label: '24h Change',
          color: isPositive ? 'text-green-400' : 'text-red-400'
        }
      case 'market_cap':
        return {
          value: marketCap > 0 ? `$${(marketCap / 1000000).toFixed(1)}M` : 'N/A',
          label: 'Market Cap',
          color: 'text-vibe-purple'
        }
      case 'activity':
        return {
          value: `${coin.holderCount || 0}`,
          label: 'Holders',
          color: 'text-vibe-green'
        }
      default:
        return {
          value: volume24h > 0 ? `$${(volume24h / 1000).toFixed(0)}K` : 'N/A',
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
                {coin.createdAt && (
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(coin.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-bold text-lg">
              {currentPrice > 0 ? `$${currentPrice.toFixed(4)}` : 'N/A'}
            </p>
            {priceChange24h !== 0 && (
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {isPositive ? '+' : ''}{priceChange24h.toFixed(1)}%
              </div>
            )}
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
              <Eye className="w-3 h-3 mr-1" />
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

        {/* Trending indicator and Enhanced Frame Share Button */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            {/* Trending Info */}
            <div className="flex items-center space-x-4">
              {rank <= 5 && (
                <span className="flex items-center text-orange-400 text-xs">
                  <Flame className="w-3 h-3 mr-1" />
                  Trending #{rank}
                </span>
              )}
              <span className="text-gray-400 text-xs">
                {filterType === 'volume' && 'High volume activity'}
                {filterType === 'gainers' && 'Strong price momentum'}
                {filterType === 'market_cap' && 'Large market presence'}
                {filterType === 'activity' && 'Active community'}
              </span>
            </div>

            {/* Enhanced Frame Share Button */}
            <EnhancedShareButton
              coin={coin}
              rank={rank}
              size="sm"
              variant={rank <= 3 ? 'trending' : 'primary'}
              context="trending"
              showPreview={false}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}