'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, BarChart3, Zap, Users, Clock,
  Filter, ArrowUpRight, Crown, Target, Flame, Eye,
  Sparkles, ShoppingCart, Loader2, CheckCircle, Plus, Minus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EnhancedShareButton } from '@/components/ui/EnhancedShareButton'
import { useTopVolumeCoins, useTopGainerCoins, useMostValuableCoins } from '@/hooks/useZoraCoins'
import { useWallet } from '@/hooks/useWallet'
import { useZoraSDK } from '@/hooks/useZoraSDK'
import toast from 'react-hot-toast'

// Dynamic formatting utilities
const formatCurrency = (value: number): string => {
  if (value === 0) return '$0'
  
  if (value < 1) {
    // For values less than $1, show with appropriate decimal places
    if (value < 0.01) return `${value.toFixed(4)}`
    if (value < 0.1) return `${value.toFixed(3)}`
    return `${value.toFixed(2)}`
  }
  
  if (value < 1000) {
    // Less than $1,000 - show whole dollars with commas
    return `${Math.round(value).toLocaleString()}`
  }
  
  if (value < 1000000) {
    // $1,000 to $999,999 - show as K
    const kValue = value / 1000
    if (kValue < 10) return `${kValue.toFixed(1)}K`
    return `${Math.round(kValue)}K`
  }
  
  if (value < 1000000000) {
    // $1M to $999M - show as M
    const mValue = value / 1000000
    if (mValue < 10) return `${mValue.toFixed(1)}M`
    return `${Math.round(mValue)}M`
  }
  
  // $1B+ - show as B
  const bValue = value / 1000000000
  if (bValue < 10) return `${bValue.toFixed(1)}B`
  return `${Math.round(bValue)}B`
}

const formatPrice = (value: number): string => {
  if (value === 0) return '$0'
  
  if (value < 0.000001) {
    return `${value.toExponential(2)}`
  }
  
  if (value < 0.01) {
    return `${value.toFixed(6)}`
  }
  
  if (value < 1) {
    return `${value.toFixed(4)}`
  }
  
  if (value < 1000) {
    return `${value.toFixed(2)}`
  }
  
  return formatCurrency(value)
}

const formatPercentage = (value: number): string => {
  if (value === 0) return '0%'
  
  const sign = value >= 0 ? '+' : ''
  
  if (Math.abs(value) < 0.01) {
    return `${sign}${value.toFixed(3)}%`
  }
  
  if (Math.abs(value) < 0.1) {
    return `${sign}${value.toFixed(2)}%`
  }
  
  return `${sign}${value.toFixed(1)}%`
}

const formatTimeAgo = (date: string | Date): string => {
  try {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return past.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  } catch {
    return 'Unknown'
  }
}

interface EnhancedTrendingFeedProps {
  onCoinSelect?: (coinAddress: string) => void
}

type TrendingFilter = 'volume' | 'gainers' | 'market_cap' | 'activity'
type TimeFilter = '1h' | '24h' | '7d' | '30d'

export const EnhancedTrendingFeed: React.FC<EnhancedTrendingFeedProps> = ({ onCoinSelect }) => {
  const { isConnected, networkConfig } = useWallet()
  const { buyCoin } = useZoraSDK()
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

  // Dynamic number formatting utility
  const formatCurrency = (value: number): string => {
    if (value === 0) return '$0'
    
    if (value < 1) {
      // For values less than $1, show with appropriate decimal places
      if (value < 0.01) return `${value.toFixed(4)}`
      if (value < 0.1) return `${value.toFixed(3)}`
      return `${value.toFixed(2)}`
    }
    
    if (value < 1000) {
      // Less than $1,000 - show whole dollars
      return `${Math.round(value).toLocaleString()}`
    }
    
    if (value < 1000000) {
      // $1,000 to $999,999 - show as K
      const kValue = value / 1000
      if (kValue < 10) return `${kValue.toFixed(1)}K`
      return `${Math.round(kValue)}K`
    }
    
    if (value < 1000000000) {
      // $1M to $999M - show as M
      const mValue = value / 1000000
      if (mValue < 10) return `${mValue.toFixed(1)}M`
      return `${Math.round(mValue)}M`
    }
    
    // $1B+ - show as B
    const bValue = value / 1000000000
    if (bValue < 10) return `${bValue.toFixed(1)}B`
    return `${Math.round(bValue)}B`
  }

  // Calculate real trending stats (no mock data)
  const totalVolume = coins.reduce((sum: number, coin: any) => sum + (parseFloat(coin.volume24h) || 0), 0)
  const avgPrice = coins.length > 0 
    ? coins.reduce((sum: number, coin: any) => sum + (parseFloat(coin.currentPrice) || 0), 0) / coins.length 
    : 0

  const handleQuickBuy = async (coin: any, ethAmount: number = 0.01) => {
    if (!isConnected) {
      toast.error('Connect wallet to buy coins')
      return
    }

    try {
      const success = await buyCoin(coin.address, ethAmount)
      if (success) {
        toast.success(`Successfully bought ${coin.symbol}! 🎉`)
      }
    } catch (error) {
      console.error('Quick buy failed:', error)
    }
  }

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
            <p className="text-xl sm:text-2xl font-bold text-vibe-purple">{coins.length}</p>
            <p className="text-xs sm:text-sm text-gray-400">Trending Coins</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-vibe-green">
              {formatCurrency(totalVolume)}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Total Volume</p>
          </div>
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-vibe-blue">
              {avgPrice > 0 ? formatPrice(avgPrice) : '$0'}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">Avg Price</p>
          </div>
        </div>
      </motion.div>

      {/* Filters - Mobile Responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col space-y-4 px-2 sm:px-0"
      >
        {/* Trending Type Filters */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center gap-2 bg-gray-800 p-1 rounded-xl max-w-full overflow-x-auto">
            {(['volume', 'gainers', 'market_cap', 'activity'] as TrendingFilter[]).map((filter) => {
              const Icon = getFilterIcon(filter)
              return (
                <button
                  key={filter}
                  onClick={() => setTrendingFilter(filter)}
                  className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    trendingFilter === filter
                      ? 'bg-vibe-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{getFilterLabel(filter)}</span>
                  <span className="sm:hidden">{filter}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex bg-gray-800 p-1 rounded-lg">
              {(['1h', '24h', '7d', '30d'] as TimeFilter[]).map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeFilter(time)}
                  className={`px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all ${
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
        </div>
      </motion.div>

      {/* Trending List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-2 sm:px-0"
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gray-700 rounded"></div>
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {coins.map((coin: any, index: number) => (
              <MobileResponsiveTrendingCard
                key={coin.address || index}
                coin={coin}
                rank={index + 1}
                onSelect={onCoinSelect}
                onQuickBuy={handleQuickBuy}
                filterType={trendingFilter}
                isConnected={isConnected}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Mobile-Responsive Trending Coin Card
const MobileResponsiveTrendingCard: React.FC<{
  coin: any
  rank: number
  onSelect?: (address: string) => void
  onQuickBuy: (coin: any, amount: number) => void
  filterType: TrendingFilter
  isConnected: boolean
}> = ({ coin, rank, onSelect, onQuickBuy, filterType, isConnected }) => {
  const [showQuickBuy, setShowQuickBuy] = useState(false)
  const [buyAmount, setBuyAmount] = useState(0.01)
  const [isBuying, setIsBuying] = useState(false)
  
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

  // Dynamic number formatting utility
  const formatCurrency = (value: number): string => {
    if (value === 0) return '$0'
    
    if (value < 1) {
      // For values less than $1, show with appropriate decimal places
      if (value < 0.01) return `${value.toFixed(4)}`
      if (value < 0.1) return `${value.toFixed(3)}`
      return `${value.toFixed(2)}`
    }
    
    if (value < 1000) {
      // Less than $1,000 - show whole dollars
      return `${Math.round(value).toLocaleString()}`
    }
    
    if (value < 1000000) {
      // $1,000 to $999,999 - show as K
      const kValue = value / 1000
      if (kValue < 10) return `${kValue.toFixed(1)}K`
      return `${Math.round(kValue)}K`
    }
    
    if (value < 1000000000) {
      // $1M to $999M - show as M
      const mValue = value / 1000000
      if (mValue < 10) return `${mValue.toFixed(1)}M`
      return `${Math.round(mValue)}M`
    }
    
    // $1B+ - show as B
    const bValue = value / 1000000000
    if (bValue < 10) return `${bValue.toFixed(1)}B`
    return `${Math.round(bValue)}B`
  }

  const getMainMetric = () => {
    switch (filterType) {
      case 'volume': 
        return {
          value: volume24h > 0 ? formatCurrency(volume24h) : 'N/A',
          label: 'Volume 24h',
          color: 'text-vibe-blue'
        }
      case 'gainers':
        return {
          value: priceChange24h !== 0 ? formatPercentage(priceChange24h) : 'N/A',
          label: '24h Change',
          color: isPositive ? 'text-green-400' : 'text-red-400'
        }
      case 'market_cap':
        return {
          value: marketCap > 0 ? formatCurrency(marketCap) : 'N/A',
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
          value: volume24h > 0 ? formatCurrency(volume24h) : 'N/A',
          label: 'Volume',
          color: 'text-vibe-blue'
        }
    }
  }

  const handleQuickBuyClick = async (amount: number) => {
    setIsBuying(true)
    try {
      await onQuickBuy(coin, amount)
      setShowQuickBuy(false)
    } catch (error) {
      console.error('Quick buy failed:', error)
    } finally {
      setIsBuying(false)
    }
  }

  const mainMetric = getMainMetric()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <Card className={`hover:border-vibe-purple transition-all ${rank <= 3 ? 'neon-border' : ''}`}>
        {/* Mobile Layout */}
        <div className="p-3 sm:p-4">
          {/* Top Row: Rank, Coin Info, Price */}
          <div className="flex items-center space-x-3 mb-3">
            {/* Rank */}
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${getRankBadgeColor()}`}>
              {rank <= 3 ? <Crown className="w-3 h-3 sm:w-4 sm:h-4" /> : rank}
            </div>

            {/* Coin Info */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <img
                src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                alt={coin.name || 'Coin'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base truncate">{coin.symbol || 'UNKNOWN'}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{coin.name || 'Unknown Coin'}</p>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-sm sm:text-base">
                {currentPrice > 0 ? formatPrice(currentPrice) : 'N/A'}
              </p>
              {priceChange24h !== 0 && (
                <div className={`flex items-center text-xs sm:text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  )}
                  {formatPercentage(priceChange24h)}
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 text-center">
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-400">Holders</p>
              <p className="font-semibold text-xs sm:text-sm">{coin.holderCount || 0}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-400">{mainMetric.label}</p>
              <p className={`font-semibold text-xs sm:text-sm ${mainMetric.color}`}>
                {mainMetric.value}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-2">
              <p className="text-xs text-gray-400">Created</p>
              <p className="font-semibold text-xs sm:text-sm">
                {coin.createdAt ? formatTimeAgo(coin.createdAt) : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Quick Buy Interface */}
          {showQuickBuy ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <span className="text-sm">Quick Buy Amount:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setBuyAmount(Math.max(0.01, buyAmount - 0.01))}
                    className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-bold min-w-[60px] text-center">
                    {buyAmount.toFixed(2)} ETH
                  </span>
                  <button
                    onClick={() => setBuyAmount(buyAmount + 0.01)}
                    className="p-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[0.01, 0.05, 0.1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBuyAmount(amount)}
                    className={`py-2 px-3 rounded-lg text-xs transition-all ${
                      buyAmount === amount
                        ? 'bg-vibe-purple text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleQuickBuyClick(buyAmount)}
                  disabled={!isConnected || isBuying}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Buying...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3 h-3 mr-2" />
                      Buy {buyAmount.toFixed(2)} ETH
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowQuickBuy(false)}
                  variant="outline"
                  size="sm"
                  className="px-4"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Action Buttons */
            <div className="flex space-x-2">
              <Button
                onClick={() => onSelect?.(coin.address)}
                size="sm"
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                <Eye className="w-3 h-3 mr-2" />
                View
              </Button>
              <Button 
                onClick={() => setShowQuickBuy(true)}
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!isConnected}
              >
                <ShoppingCart className="w-3 h-3 mr-2" />
                {isConnected ? 'Buy' : 'Connect'}
              </Button>
            </div>
          )}

          {/* Bottom Row: Enhanced Share Button */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              {/* Trending indicator */}
              <div className="flex items-center space-x-2">
                {rank <= 5 && (
                  <span className="flex items-center text-orange-400 text-xs">
                    <Flame className="w-3 h-3 mr-1" />
                    Trending #{rank}
                  </span>
                )}
                <span className="text-gray-400 text-xs">
                  {filterType === 'volume' && 'High volume'}
                  {filterType === 'gainers' && 'Strong momentum'}
                  {filterType === 'market_cap' && 'Large market cap'}
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
        </div>
      </Card>
    </motion.div>
  )
}