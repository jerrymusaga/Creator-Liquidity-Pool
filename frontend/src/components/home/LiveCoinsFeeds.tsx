// components/home/LiveCoinsFeed.tsx (Updated)
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Zap, Crown, Users, 
  Coins, ArrowUpRight, RefreshCw,
  ExternalLink, Play, FireExtinguisher, AlertCircle, Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useZoraSDK } from '@/hooks/useZoraSDK'
import { useWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'

interface LiveCoinsFeedProps {
  onCoinSelect?: (coinAddress: string) => void
}

type FilterType = 'trending' | 'new' | 'gainers'

interface ZoraCoinData {
  address: string
  name: string
  symbol: string
  description: string
  image: string
  totalSupply: string
  marketCap: string
  volume24h: string
  holderCount: number
  currentPrice: string
  priceChange24h: number
  creator: {
    address: string
    username: string
    avatar: string
  }
  createdAt: string
  isV4: boolean
  autoRewardsEnabled: boolean
}

export const LiveCoinsFeed: React.FC<LiveCoinsFeedProps> = ({ onCoinSelect }) => {
  const [coins, setCoins] = useState<ZoraCoinData[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('trending')
  const [error, setError] = useState<string | null>(null)
  
  const { getCoins, isLoading, buyCoin, networkConfig } = useZoraSDK()
  const { isConnected, isOnCorrectNetwork } = useWallet()

  // Load coins on mount and filter change
  useEffect(() => {
    loadCoins()
  }, [selectedFilter])

  const loadCoins = async () => {
    try {
      setError(null)
      const fetchedCoins = await getCoins(selectedFilter, 20)
      setCoins(fetchedCoins)
      
      if (fetchedCoins.length === 0) {
        setError('No coins found. Try refreshing or check your network connection.')
      }
    } catch (error) {
      console.error('Failed to load coins:', error)
      setError('Failed to load Creator Coins from Zora. Please try again.')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadCoins()
    setIsRefreshing(false)
    toast.success('Creator Coins refreshed!')
  }

  const handleQuickBuy = async (coin: ZoraCoinData, ethAmount: number) => {
    if (!isConnected) {
      toast.error('Please connect wallet first')
      return
    }

    if (!isOnCorrectNetwork) {
      toast.error(`Please switch to ${networkConfig.name}`)
      return
    }

    const success = await buyCoin(coin.address, ethAmount)
    if (success) {
      // Refresh coin data to show updated stats
      await loadCoins()
    }
  }

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (isNaN(num)) return '$0.00'
    if (num < 0.000001) return '<$0.000001'
    if (num < 0.01) return `$${num.toFixed(6)}`
    return `$${num.toFixed(4)}`
  }

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume)
    if (isNaN(num)) return '$0'
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date()
      const created = new Date(dateString)
      const diffMs = now.getTime() - created.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) return `${diffDays}d ago`
      if (diffHours > 0) return `${diffHours}h ago`
      return 'Just now'
    } catch {
      return 'Unknown'
    }
  }

  const getFilterIcon = (filter: FilterType) => {
    switch (filter) {
      case 'trending': return TrendingUp
      case 'new': return FireExtinguisher
      case 'gainers': return Coins
      default: return TrendingUp
    }
  }

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'trending': return 'Top Volume'
      case 'new': return 'Recently Created'
      case 'gainers': return 'Top Gainers'
      default: return 'Trending'
    }
  }

  // Loading state
  if (isLoading && coins.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-vibe rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Loader2 className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-gray-400">Loading live Creator Coins from Zora...</p>
          <p className="text-sm text-gray-500 mt-2">
            Fetching data from {networkConfig.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
          <Zap className="w-8 h-8 text-vibe-purple mr-3" />
          Live Creator{' '}
          <span className="bg-gradient-vibe bg-clip-text text-transparent ml-2">
            Coins
          </span>
        </h1>
        <p className="text-gray-400 mb-6">
          Real Creator Coins on Zora V4 from {networkConfig.name}
        </p>

        {/* Network Status */}
        {!isOnCorrectNetwork && isConnected && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400 font-medium">Wrong Network</span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              Switch to {networkConfig.name} to see live coins
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-center space-x-2 mb-4 flex-wrap gap-2">
          {(['trending', 'new', 'gainers'] as FilterType[]).map((filter) => {
            const Icon = getFilterIcon(filter)
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === filter
                    ? 'bg-vibe-purple text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {getFilterLabel(filter)}
              </button>
            )
          })}
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        {coins.length > 0 && (
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-purple">{coins.length}</p>
              <p className="text-xs text-gray-400">Live Coins</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-green">
                {formatVolume(coins.reduce((sum, coin) => sum + parseFloat(coin.volume24h || '0'), 0).toString())}
              </p>
              <p className="text-xs text-gray-400">24h Volume</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-blue">
                {coins.reduce((sum, coin) => sum + coin.holderCount, 0)}
              </p>
              <p className="text-xs text-gray-400">Total Holders</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="font-semibold mb-2 text-red-400">Unable to Load Coins</h3>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <Button onClick={handleRefresh} disabled={isRefreshing} size="sm">
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </Card>
      )}

      {/* Coins List */}
      {!error && (
        <div className="space-y-4">
          {coins.length === 0 && !isLoading ? (
            <Card className="p-8 text-center">
              <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No {getFilterLabel(selectedFilter)} Found</h3>
              <p className="text-sm text-gray-400 mb-4">
                {selectedFilter === 'new' 
                  ? 'No new coins have been created recently.'
                  : selectedFilter === 'gainers'
                  ? 'No coins with positive price changes found.'
                  : 'No coins with volume found.'
                }
              </p>
              <Button onClick={handleRefresh} size="sm" variant="outline">
                Refresh Data
              </Button>
            </Card>
          ) : (
            coins.map((coin, index) => (
              <CoinCard
                key={coin.address}
                coin={coin}
                index={index}
                onSelect={onCoinSelect}
                onQuickBuy={handleQuickBuy}
                isConnected={isConnected}
                isOnCorrectNetwork={isOnCorrectNetwork}
                networkConfig={networkConfig}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Individual Coin Card Component
const CoinCard: React.FC<{
  coin: ZoraCoinData
  index: number
  onSelect?: (address: string) => void
  onQuickBuy: (coin: ZoraCoinData, amount: number) => void
  isConnected: boolean
  isOnCorrectNetwork: boolean
  networkConfig: any
}> = ({ coin, index, onSelect, onQuickBuy, isConnected, isOnCorrectNetwork, networkConfig }) => {
  const [showQuickBuy, setShowQuickBuy] = useState(false)
  const [buyAmount, setBuyAmount] = useState(0.01)

  const isPositive = coin.priceChange24h >= 0
  const isTopPerformer = index < 3
  const hasVolume = parseFloat(coin.volume24h || '0') > 0

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date()
      const created = new Date(dateString)
      const diffMs = now.getTime() - created.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) return `${diffDays}d ago`
      if (diffHours > 0) return `${diffHours}h ago`
      return 'Just now'
    } catch {
      return 'Unknown'
    }
  }

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (isNaN(num)) return '$0.00'
    if (num < 0.000001) return '<$0.000001'
    if (num < 0.01) return `$${num.toFixed(6)}`
    return `$${num.toFixed(4)}`
  }

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume)
    if (isNaN(num)) return '$0'
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num.toFixed(0)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`relative overflow-hidden ${isTopPerformer && hasVolume ? 'neon-border' : ''}`}>
        {/* Top Performer Badge */}
        {isTopPerformer && hasVolume && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-vibe rounded-full px-3 py-1 text-xs font-bold text-white flex items-center">
              <Crown className="w-3 h-3 mr-1" />
              #{index + 1}
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                alt={coin.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`
                }}
              />
              <div>
                <h3 className="font-bold text-lg">{coin.name}</h3>
                <p className="text-vibe-purple font-mono">${coin.symbol}</p>
                <p className="text-xs text-gray-400">
                  by {coin.creator.username} • {getTimeAgo(coin.createdAt)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold">{formatPrice(coin.currentPrice)}</p>
              {coin.priceChange24h !== 0 && (
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {isPositive ? '+' : ''}{coin.priceChange24h.toFixed(1)}%
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {coin.description && (
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {coin.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 text-vibe-blue mr-1" />
                <span className="text-xs text-gray-400">Holders</span>
              </div>
              <p className="font-semibold">{coin.holderCount}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-vibe-green mr-1" />
                <span className="text-xs text-gray-400">Volume 24h</span>
              </div>
              <p className="font-semibold">{formatVolume(coin.volume24h)}</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-1">
                <Coins className="w-4 h-4 text-vibe-purple mr-1" />
                <span className="text-xs text-gray-400">Market Cap</span>
              </div>
              <p className="font-semibold">{formatVolume(coin.marketCap)}</p>
            </div>
          </div>

          {/* V4 Rewards Badge */}
          {coin.isV4 && coin.autoRewardsEnabled && (
            <div className="bg-vibe-green/10 border border-vibe-green/20 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-vibe-green mr-2" />
                  <span className="text-sm font-medium text-vibe-green">V4 Auto Rewards</span>
                </div>
                <span className="text-xs text-gray-400">Creator earns 50%</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {showQuickBuy ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="flex bg-gray-800 rounded-lg">
                    {[0.01, 0.05, 0.1].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setBuyAmount(amount)}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                          buyAmount === amount
                            ? 'bg-vibe-purple text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {amount} ETH
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => onQuickBuy(coin, buyAmount)}
                  disabled={!isConnected || !isOnCorrectNetwork}
                  size="sm"
                  className="flex-1"
                >
                  {!isConnected ? 'Connect Wallet' : 
                   !isOnCorrectNetwork ? 'Wrong Network' :
                   `Buy ${buyAmount} ETH`}
                </Button>
                <Button
                  onClick={() => setShowQuickBuy(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button
                onClick={() => onSelect?.(coin.address)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                onClick={() => setShowQuickBuy(true)}
                size="sm"
                className="flex-1"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Quick Buy
              </Button>
              <Button
                onClick={() => window.open(networkConfig.getAddressUrl(coin.address), '_blank')}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}