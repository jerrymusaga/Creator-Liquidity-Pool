'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, TrendingUp, Zap, Users, Crown, FireExtinguisher,
  ArrowRight, Eye, Plus, Cast, Share, Sparkles, BarChart3,
  ExternalLink, ShoppingCart
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EnhancedShareButton } from '@/components/ui/EnhancedShareButton'
import { useNewCoins, useTopGainerCoins, useMostValuableCoins } from '@/hooks/useZoraCoins'
import { useUserCreatedCoins } from '@/hooks/useZoraProfile'
import { useWallet } from '@/hooks/useWallet'
import { useZoraSDK } from '@/hooks/useZoraSDK'

interface PersonalizedHomeFeedProps {
  onCoinSelect?: (coinAddress: string) => void
}

export const PersonalizedHomeFeed: React.FC<PersonalizedHomeFeedProps> = ({ onCoinSelect }) => {
  const { isConnected, address, networkConfig } = useWallet()
  const { buyCoin } = useZoraSDK()
  const { data: newCoins, isLoading: loadingNew } = useNewCoins({ count: 6 })
  const { data: topGainers, isLoading: loadingGainers } = useTopGainerCoins({ count: 4 })
  const { data: popularCoins, isLoading: loadingPopular } = useMostValuableCoins({ count: 8 })
  const { data: userCreatedCoins, isLoading: loadingUserCoins } = useUserCreatedCoins()

  // Get real spotlight from actual top performer
  const getTopPerformer = () => {
    if (!topGainers || topGainers.length === 0) return null
    
    const topCoin = topGainers[0]
    if (!topCoin) return null
    
    return {
      creator: {
        id: topCoin.creatorAddress || '1',
        username: topCoin.creator?.username || `${topCoin.creatorAddress?.slice(0,6)}...`,
        avatar: topCoin.creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${topCoin.creatorAddress}`,
        isCreator: true,
        followers: undefined, // No mock data
        verificationStatus: 'unverified' as const,
      },
      coin: {
        address: topCoin.address,
        symbol: topCoin.symbol,
        name: topCoin.name,
        image: topCoin.image,
        currentPrice: parseFloat(topCoin.currentPrice) || 0,
        totalSupply: parseInt(topCoin.totalSupply) || 0,
        holderCount: topCoin.holderCount || 0,
        volume24h: parseFloat(topCoin.volume24h) || 0,
        creator: topCoin.creator,
        coinType: 'creator' as const,
      },
      reason: 'Top Performing Creator Coin',
      spotlightType: 'top_performer' as const,
      metrics: {
        growthRate: parseFloat(topCoin.priceChange24h) || 0,
        volumeIncrease: parseFloat(topCoin.volume24h) || 0,
        holderGrowth: topCoin.holderCount || 0,
      },
    }
  }

  const spotlight = getTopPerformer()

  const handleBuyCoin = async (coin: any, quickAmount: number = 0.01) => {
    if (!isConnected) {
      console.error('Connect wallet to buy coins')
      return
    }

    try {
      const success = await buyCoin(coin.address, quickAmount)
      if (success) {
        console.log(`Successfully bought ${coin.symbol}! 🎉`)
      }
    } catch (error) {
      console.error('Buy failed:', error)
    }
  }

  const handleViewCoin = (coin: any) => {
    if (onCoinSelect) {
      onCoinSelect(coin.address)
    } else {
      // Open in external explorer as fallback
      window.open(`${networkConfig.explorerUrl}/address/${coin.address}`, '_blank')
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 sm:py-12 px-4 relative overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/10 to-blue-900/10 rounded-3xl"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
          >
            Discover{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Creator Coins
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg sm:text-xl mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            {isConnected 
              ? 'Your personalized feed of trending Creator Coins and rising opportunities'
              : 'Explore the hottest Creator Coins and discover the next big opportunities'
            }
          </motion.p>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center space-x-8 text-sm sm:text-base"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{(newCoins?.length || 0) + (popularCoins?.length || 0)}</div>
              <div className="text-gray-400">Live Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">
                ${((popularCoins?.reduce((sum, coin) => sum + (parseFloat(coin.volume24h) || 0), 0) || 0) / 1000000).toFixed(1)}M
              </div>
              <div className="text-gray-400">Volume</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{networkConfig.name}</div>
              <div className="text-gray-400">Network</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* User's Created Coins */}
      {isConnected && (loadingUserCoins || (userCreatedCoins && userCreatedCoins.length > 0)) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center text-white">
              <Crown className="w-6 h-6 text-yellow-400 mr-3" />
              Your Creator Coins
            </h2>
            <Button variant="outline" size="sm" className="border-green-500 text-green-400 hover:bg-green-500/10">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {loadingUserCoins ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              userCreatedCoins?.slice(0, 4).map((coin) => (
                <motion.div
                  key={coin.address}
                  whileHover={{ scale: 1.02 }}
                  className="p-6 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-700 transition-all cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700"
                  onClick={() => onCoinSelect?.(coin.address)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={coin.image}
                      alt={coin.symbol}
                      className="w-12 h-12 rounded-full border-2 border-green-500/30"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{coin.name}</h3>
                        <span className="text-sm text-green-400 font-mono bg-green-500/10 px-2 py-1 rounded">
                          ${coin.symbol}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {coin.holderCount} holders
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          ${(parseFloat(coin.volume24h) / 1000).toFixed(1)}K volume
                        </span>
                        <span className={`flex items-center ${parseFloat(coin.priceChange24h.toString()) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {parseFloat(coin.priceChange24h.toString()) >= 0 ? '+' : ''}{coin.priceChange24h}%
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      )}

      {/* Creator Spotlight - Real Data Only */}
      {spotlight && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center text-white">
              <Star className="w-6 h-6 text-yellow-400 mr-3" />
              Top Performer
            </h2>
          </div>
          
          <Card className="p-8 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20 relative overflow-hidden border border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 animate-gradient-x"></div>
            
            <div className="absolute top-4 right-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Top Performer
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-6 mb-6">
                <img
                  src={spotlight.creator.avatar}
                  alt={spotlight.creator.username}
                  className="w-20 h-20 rounded-full border-3 border-purple-500/50"
                />
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{spotlight.creator.username}</h3>
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <p className="text-purple-300 font-medium">{spotlight.reason}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-300">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {spotlight.coin.holderCount} coin holders
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      ${spotlight.coin.symbol}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-sm text-green-300 mb-1">24h Change</p>
                  <p className="text-2xl font-bold text-green-400">+{spotlight.metrics.growthRate.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-300 mb-1">Volume 24h</p>
                  <p className="text-2xl font-bold text-blue-400">${(spotlight.coin.volume24h / 1000).toFixed(1)}K</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-300 mb-1">Current Price</p>
                  <p className="text-2xl font-bold text-purple-400">${spotlight.coin.currentPrice.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={() => handleViewCoin(spotlight.coin)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Explore Creator
                </Button>
                <EnhancedShareButton 
                  coin={spotlight.coin}
                  context="success"
                  size="md"
                  variant="secondary"
                  className="px-6"
                />
              </div>
            </div>
          </Card>
        </motion.section>
      )}

      {/* Rising Stars */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center text-white">
            <FireExtinguisher className="w-6 h-6 text-orange-400 mr-3" />
            Rising Stars
          </h2>
          <Button variant="outline" size="sm" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {loadingNew ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="w-full h-32 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(newCoins || []).slice(0, 6).map((coin: any, index: number) => (
              <CoinCard
                key={coin.address || index}
                coin={coin}
                index={index}
                onSelect={handleViewCoin}
                onBuy={handleBuyCoin}
                isRisingStar
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Top Gainers */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center text-white">
            <TrendingUp className="w-6 h-6 text-green-400 mr-3" />
            Top Gainers
          </h2>
          <Button variant="outline" size="sm" className="border-green-500 text-green-400 hover:bg-green-500/10">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(topGainers || []).map((coin: any, index: number) => (
            <motion.div
              key={coin.address || index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="p-6 text-center bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 hover:border-green-400/50 transition-all">
                <img
                  src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                  alt={coin.name || 'Coin'}
                  className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-green-500/30"
                />
                <h3 className="font-semibold mb-1 text-white">{coin.symbol || 'UNKNOWN'}</h3>
                <p className="text-sm text-gray-300 mb-3 truncate">{coin.name || 'Unknown Coin'}</p>
                
                {/* Real price change data */}
                {coin.priceChange24h && (
                  <div className="flex items-center justify-center text-green-400 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{parseFloat(coin.priceChange24h).toFixed(1)}%
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-green-500/20">
                  <EnhancedShareButton
                    coin={coin}
                    context="trending"
                    size="sm"
                    variant="minimal"
                  />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Popular Creators */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center text-white">
            <Users className="w-6 h-6 text-blue-400 mr-3" />
            Popular Creators
          </h2>
          <Button variant="outline" size="sm" className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(popularCoins || []).slice(0, 4).map((coin: any, index: number) => (
            <motion.div
              key={coin.address || index}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 hover:border-blue-400/50 transition-all">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                    alt={coin.name || 'Creator'}
                    className="w-12 h-12 rounded-full border-2 border-blue-500/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{coin.name || 'Unknown Creator'}</h3>
                    <p className="text-sm text-gray-300">{coin.symbol || 'UNKNOWN'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleViewCoin(coin)}
                      size="sm" 
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <EnhancedShareButton 
                      coin={coin}
                      context="discovery"
                      size="sm"
                      variant="minimal"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-xs mb-1">Holders</p>
                    <p className="font-semibold text-white">{coin.holderCount || 0}</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-xs mb-1">Volume</p>
                    <p className="font-semibold text-white">${((coin.volume24h || 0) / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

// Enhanced Individual Coin Card Component
const CoinCard: React.FC<{
  coin: any
  index: number
  onSelect?: (coin: any) => void
  onBuy?: (coin: any, amount: number) => void
  isRisingStar?: boolean
}> = ({ coin, index, onSelect, onBuy, isRisingStar }) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
    >
      <Card className="p-6 hover:border-purple-500/50 transition-all relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
        {isRisingStar && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Rising
            </div>
          </div>
        )}
        
        <div className="text-center mb-4">
          <div className="relative inline-block mb-3">
            <img
              src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
              alt={coin.name || 'Coin'}
              className="w-16 h-16 rounded-full mx-auto border-2 border-purple-500/30"
            />
            {isRisingStar && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <h3 className="font-bold text-white text-lg">{coin.symbol || 'UNKNOWN'}</h3>
          <p className="text-sm text-gray-300 truncate">{coin.name || 'Unknown Coin'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-center mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-purple-300 mb-1">Price</p>
            <p className="font-semibold text-white">${(coin.currentPrice || 0).toFixed(4)}</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-blue-300 mb-1">Holders</p>
            <p className="font-semibold text-white">{coin.holderCount || 0}</p>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          <Button
            onClick={() => onSelect?.(coin)}
            size="sm"
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button 
            onClick={() => onBuy?.(coin, 0.01)}
            size="sm" 
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Buy
          </Button>
        </div>

        {/* Enhanced frame share at bottom */}
        <div className="flex items-center justify-center pt-3 border-t border-gray-700">
          <EnhancedShareButton 
            coin={coin}
            context={isRisingStar ? 'discovery' : 'custom'}
            size="sm"
            variant="minimal"
          />
        </div>
      </Card>
    </motion.div>
  )
}