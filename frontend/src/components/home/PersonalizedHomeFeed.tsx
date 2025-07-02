// components/home/PersonalizedHomeFeed.tsx
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, TrendingUp, Zap, Users, Crown, FireExtinguisher,
  ArrowRight, Eye, Heart, MessageCircle, Share, Plus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNewCoins, useTopGainerCoins, useMostValuableCoins } from '@/hooks/useZoraCoins'
import { useWallet } from '@/hooks/useWallet'
import { CreatorSpotlight, CreatorCategory } from '@/types'

interface PersonalizedHomeFeedProps {
  onCoinSelect?: (coinAddress: string) => void
}

// Mock data for discovery features (would come from backend/API)
const creatorCategories: CreatorCategory[] = [
  { id: '1', name: 'Gaming', description: 'Gaming creators and streamers', color: '#8B5CF6', icon: '🎮' },
  { id: '2', name: 'Art', description: 'Digital artists and NFT creators', color: '#EC4899', icon: '🎨' },
  { id: '3', name: 'Music', description: 'Musicians and audio creators', color: '#10B981', icon: '🎵' },
  { id: '4', name: 'Content', description: 'Video creators and influencers', color: '#F59E0B', icon: '📹' },
  { id: '5', name: 'Tech', description: 'Developers and tech educators', color: '#3B82F6', icon: '💻' },
  { id: '6', name: 'Fitness', description: 'Health and fitness coaches', color: '#EF4444', icon: '💪' },
]

export const PersonalizedHomeFeed: React.FC<PersonalizedHomeFeedProps> = ({ onCoinSelect }) => {
  const { isConnected } = useWallet()
  const { data: newCoins, isLoading: loadingNew } = useNewCoins({ count: 6 })
  const { data: topGainers, isLoading: loadingGainers } = useTopGainerCoins({ count: 4 })
  const { data: popularCoins, isLoading: loadingPopular } = useMostValuableCoins({ count: 8 })

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Mock spotlight data (would be calculated backend)
  const spotlights: CreatorSpotlight[] = [
    {
      creator: {
        id: '1',
        username: 'cryptoartist',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist',
        isCreator: true,
        followers: 15420,
        verificationStatus: 'verified' as const,
        categories: [creatorCategories[1]], // Art
      },
      coin: {
        address: '0x123',
        symbol: 'CART',
        name: 'CryptoArtist Token',
        image: 'https://api.dicebear.com/7.x/identicon/svg?seed=CART',
        currentPrice: 0.045,
        totalSupply: 1000000,
        holderCount: 234,
        volume24h: 12400,
        creator: {} as any,
        coinType: 'creator' as const,
      },
      reason: 'Featured Artist of the Week',
      spotlightType: 'featured' as const,
      metrics: {
        growthRate: 156,
        volumeIncrease: 89,
        holderGrowth: 45,
      },
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-4xl font-bold mb-4">
          Discover{' '}
          <span className="bg-gradient-vibe bg-clip-text text-transparent">
            Creator Coins
          </span>
        </h1>
        <p className="text-gray-400 text-lg mb-6">
          {isConnected 
            ? 'Personalized recommendations based on your activity'
            : 'Explore trending Creator Coins and discover new talent'
          }
        </p>
      </motion.div>

      {/* Creator Spotlight */}
      {spotlights.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Star className="w-6 h-6 text-vibe-purple mr-2" />
              Creator Spotlight
            </h2>
          </div>
          
          <Card className="p-6 bg-gradient-card relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <div className="bg-vibe-purple/20 text-vibe-purple px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={spotlights[0].creator.avatar}
                alt={spotlights[0].creator.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold">{spotlights[0].creator.username}</h3>
                  {spotlights[0].creator.verificationStatus === 'verified' && (
                    <Crown className="w-5 h-5 text-vibe-purple" />
                  )}
                </div>
                <p className="text-gray-400">{spotlights[0].reason}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>{spotlights[0].creator.followers?.toLocaleString()} followers</span>
                  <span>•</span>
                  <span>{spotlights[0].coin.holderCount} coin holders</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Growth Rate</p>
                <p className="text-lg font-bold text-green-400">+{spotlights[0].metrics.growthRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Volume 24h</p>
                <p className="text-lg font-bold text-vibe-blue">${(spotlights[0].coin.volume24h / 1000).toFixed(1)}K</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Price</p>
                <p className="text-lg font-bold">${spotlights[0].coin.currentPrice.toFixed(4)}</p>
              </div>
            </div>

            <Button 
              onClick={() => onCoinSelect?.(spotlights[0].coin.address)}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              Explore Creator
            </Button>
          </Card>
        </motion.section>
      )}

      {/* Categories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            All Categories
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {creatorCategories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-vibe-purple/20 border border-vibe-purple/40'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <p className="font-medium text-sm">{category.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Rising Stars */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <FireExtinguisher className="w-6 h-6 text-orange-400 mr-2" />
            Rising Stars
          </h2>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        {loadingNew ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="w-full h-32 bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(newCoins || []).slice(0, 6).map((coin: any, index: number) => (
              <CoinCard
                key={coin.address || index}
                coin={coin}
                index={index}
                onSelect={onCoinSelect}
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
          <h2 className="text-2xl font-bold flex items-center">
            <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
            Top Gainers
          </h2>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(topGainers || []).map((coin: any, index: number) => (
            <Card key={coin.address || index} className="p-4 text-center">
              <img
                src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                alt={coin.name || 'Coin'}
                className="w-12 h-12 rounded-full mx-auto mb-3"
              />
              <h3 className="font-semibold mb-1">{coin.symbol || 'UNKNOWN'}</h3>
              <p className="text-sm text-gray-400 mb-2">{coin.name || 'Unknown Coin'}</p>
              <div className="flex items-center justify-center text-green-400 text-sm">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{((Math.random() * 50) + 10).toFixed(1)}%
              </div>
            </Card>
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
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="w-6 h-6 text-vibe-blue mr-2" />
            Popular Creators
          </h2>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(popularCoins || []).slice(0, 4).map((coin: any, index: number) => (
            <Card key={coin.address || index} className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
                  alt={coin.name || 'Creator'}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{coin.name || 'Unknown Creator'}</h3>
                  <p className="text-sm text-gray-400">{coin.symbol || 'UNKNOWN'}</p>
                </div>
                <Button size="sm" variant="outline">
                  Follow
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Holders</p>
                  <p className="font-semibold">{coin.holderCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Volume</p>
                  <p className="font-semibold">${((coin.volume24h || 0) / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.section>
    </div>
  )
}

// Individual Coin Card Component
const CoinCard: React.FC<{
  coin: any
  index: number
  onSelect?: (address: string) => void
  isRisingStar?: boolean
}> = ({ coin, index, onSelect, isRisingStar }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-4 hover:border-vibe-purple transition-colors relative">
        {isRisingStar && (
          <div className="absolute top-2 right-2">
            <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-bold">
              Rising
            </div>
          </div>
        )}
        
        <div className="text-center mb-3">
          <img
            src={coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`}
            alt={coin.name || 'Coin'}
            className="w-16 h-16 rounded-full mx-auto mb-3"
          />
          <h3 className="font-bold">{coin.symbol || 'UNKNOWN'}</h3>
          <p className="text-sm text-gray-400 truncate">{coin.name || 'Unknown Coin'}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-center mb-3">
          <div>
            <p className="text-gray-400">Price</p>
            <p className="font-semibold">${(coin.currentPrice || 0).toFixed(4)}</p>
          </div>
          <div>
            <p className="text-gray-400">Holders</p>
            <p className="font-semibold">{coin.holderCount || 0}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => onSelect?.(coin.address)}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" className="flex-1">
            <Zap className="w-3 h-3 mr-1" />
            Buy
          </Button>
        </div>

        {/* Social engagement mockup */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
          <button className="flex items-center text-xs text-gray-400 hover:text-white">
            <Heart className="w-3 h-3 mr-1" />
            {Math.floor(Math.random() * 50) + 10}
          </button>
          <button className="flex items-center text-xs text-gray-400 hover:text-white">
            <MessageCircle className="w-3 h-3 mr-1" />
            {Math.floor(Math.random() * 20) + 5}
          </button>
          <button className="flex items-center text-xs text-gray-400 hover:text-white">
            <Share className="w-3 h-3 mr-1" />
            Share
          </button>
        </div>
      </Card>
    </motion.div>
  )
}