import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, Share, Copy, ExternalLink, Edit3, Crown,
  TrendingUp, Users, Coins, Zap, Star, Play, Eye,
  BarChart3, Calendar, Award, Target, Link as LinkIcon
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
import { Economy, CreatorCoin, ContentCoin } from '@/types'
import toast from 'react-hot-toast'

export const ProfilePage: React.FC = () => {
  const { user, economies, coinHoldings, transactions } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'coins' | 'content' | 'analytics'>('overview')

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm w-full">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connect Your Account</h2>
          <p className="text-gray-400 mb-6">
            Connect to view your creator profile
          </p>
          <Button className="w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  // Get user's created economies
  const userEconomies = economies.filter(e => e.creator.id === user.id)
  const totalEarnings = userEconomies.reduce((sum, e) => sum + e.totalEarnings, 0)
  const totalVolume = userEconomies.reduce((sum, e) => sum + e.creatorCoin.volume24h, 0)
  const totalHolders = userEconomies.reduce((sum, e) => sum + e.creatorCoin.holderCount, 0)
  const allContentCoins = userEconomies.flatMap(e => e.contentCoins)

  // Portfolio value
  const portfolioValue = coinHoldings.reduce((sum, holding) => sum + holding.currentValue, 0)

  const handleShare = () => {
    const shareText = `Check out ${user.username}'s Creator Economy on @zora! 🚀\n\nCreator Coins: ${userEconomies.length}\nTotal Holders: ${totalHolders}\n\nJoin the economy:`
    
    if (navigator.share) {
      navigator.share({
        title: `${user.username} on Vibe`,
        text: shareText,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
      toast.success('Profile link copied!')
    }
  }

  const handleCopyAddress = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress)
      toast.success('Address copied!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-vibe"></div>
        
        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-16 mb-4">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-gray-900 bg-gray-800"
            />
            
            {/* Profile Actions */}
            <div className="absolute top-0 right-0 flex space-x-2">
              <button 
                onClick={handleShare}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              {user.isCreator && (
                <Crown className="w-5 h-5 text-vibe-purple" />
              )}
            </div>
            
            {user.farcasterHandle && (
              <p className="text-gray-400 mb-2">@{user.farcasterHandle}</p>
            )}

            {user.walletAddress && (
              <button 
                onClick={handleCopyAddress}
                className="flex items-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                <span className="mr-2">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Stats Grid */}
          {user.isCreator && userEconomies.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-purple">{userEconomies.length}</p>
                <p className="text-xs text-gray-400">Coins</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-blue">{totalHolders}</p>
                <p className="text-xs text-gray-400">Holders</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-green">${(totalVolume / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-400">Volume</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-pink">{allContentCoins.length}</p>
                <p className="text-xs text-gray-400">Content</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-purple">{coinHoldings.length}</p>
                <p className="text-xs text-gray-400">Holdings</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-green">${portfolioValue.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Portfolio</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-vibe-blue">{transactions.length}</p>
                <p className="text-xs text-gray-400">Trades</p>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              ...(user.isCreator ? [
                { id: 'coins', label: 'Coins', icon: Coins },
                { id: 'content', label: 'Content', icon: Play },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ] : [
                { id: 'coins', label: 'Holdings', icon: Coins },
                { id: 'analytics', label: 'Activity', icon: BarChart3 }
              ])
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-vibe-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-20">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {user.isCreator ? (
              <>
                {/* Creator Dashboard */}
                {userEconomies.length > 0 ? (
                  <>
                    {/* V4 Earnings Card */}
                    <Card className="p-6 bg-gradient-card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Zap className="w-6 h-6 text-vibe-green mr-3" />
                          <div>
                            <h3 className="font-semibold">V4 Auto Earnings</h3>
                            <p className="text-sm text-gray-400">50% of all trading fees</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-vibe-green">
                            ${totalEarnings.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">Total Earned</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Estimated daily: ${(totalVolume * 0.003 * 0.50).toFixed(2)} ZORA
                      </div>
                    </Card>

                    {/* Top Performing Coin */}
                    {userEconomies.length > 0 && (
                      <Card className="p-4">
                        <h3 className="font-semibold mb-3">Top Performing Coin</h3>
                        <CreatorCoinMiniCard economy={userEconomies[0]} />
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="py-4">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Content Coin
                      </Button>
                      <Button variant="outline" className="py-4">
                        <Share className="w-5 h-5 mr-2" />
                        Share Economy
                      </Button>
                    </div>
                  </>
                ) : (
                  /* No Economy Yet */
                  <Card className="p-8 text-center">
                    <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Launch Your Economy</h3>
                    <p className="text-gray-400 mb-6">
                      Create your Creator Coin and start earning from your content
                    </p>
                    <Button className="w-full py-4">
                      <Zap className="w-5 h-5 mr-2" />
                      Create Your First Coin
                    </Button>
                  </Card>
                )}
              </>
            ) : (
              /* Fan Dashboard */
              <>
                {/* Portfolio Summary */}
                <Card className="p-6 bg-gradient-card">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
                    <p className="text-2xl font-bold mb-2">${portfolioValue.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">
                      Supporting {new Set(coinHoldings.map(h => h.coin.creator?.id)).size} creators
                    </p>
                  </div>
                </Card>

                {/* Favorite Creators */}
                {coinHoldings.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Your Creator Coins</h3>
                    <div className="space-y-3">
                      {coinHoldings.slice(0, 3).map((holding) => (
                        <div key={holding.coinAddress} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={holding.coin.image}
                              alt={holding.coin.symbol}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{holding.coin.symbol}</p>
                              <p className="text-sm text-gray-400">{holding.balance.toFixed(0)} coins</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${holding.currentValue.toFixed(2)}</p>
                            <p className={`text-sm ${
                              holding.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {holding.unrealizedPnL >= 0 ? '+' : ''}{holding.unrealizedPnLPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Discover More */}
                <Button variant="outline" className="w-full py-4">
                  <Star className="w-5 h-5 mr-2" />
                  Discover New Creators
                </Button>
              </>
            )}
          </motion.div>
        )}

        {/* Coins Tab */}
        {activeTab === 'coins' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {user.isCreator ? (
              /* Creator's Coins */
              userEconomies.length === 0 ? (
                <Card className="p-8 text-center">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Creator Coins Yet</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Launch your first Creator Coin to start building your economy
                  </p>
                  <Button>
                    Create Your First Coin
                  </Button>
                </Card>
              ) : (
                userEconomies.map((economy) => (
                  <CreatorCoinCard key={economy.id} economy={economy} />
                ))
              )
            ) : (
              /* Fan's Holdings */
              coinHoldings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Holdings Yet</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Start trading Creator Coins to build your portfolio
                  </p>
                  <Button>
                    Explore Creators
                  </Button>
                </Card>
              ) : (
                coinHoldings.map((holding) => (
                  <HoldingCard key={holding.coinAddress} holding={holding} />
                ))
              )
            )}
          </motion.div>
        )}

        {/* Content Tab (Creator Only) */}
        {activeTab === 'content' && user.isCreator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {allContentCoins.length === 0 ? (
              <Card className="p-8 text-center">
                <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Content Coins Yet</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create Content Coins for your viral posts and let fans speculate!
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Content Coin
                </Button>
              </Card>
            ) : (
              allContentCoins.map((contentCoin) => (
                <ContentCoinCard key={contentCoin.address} contentCoin={contentCoin} />
              ))
            )}
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                {user.isCreator ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Volume (24h)</span>
                      <span className="font-semibold">${(totalVolume / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Holders</span>
                      <span className="font-semibold">{totalHolders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Content Coins</span>
                      <span className="font-semibold">{allContentCoins.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Avg Daily Earnings</span>
                      <span className="font-semibold text-vibe-green">
                        ${(totalVolume * 0.003 * 0.50).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Trades</span>
                      <span className="font-semibold">{transactions.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Portfolio Value</span>
                      <span className="font-semibold">${portfolioValue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creators Supported</span>
                      <span className="font-semibold">
                        {new Set(coinHoldings.map(h => h.coin.creator?.id)).size}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Helper Components
const CreatorCoinCard: React.FC<{ economy: Economy }> = ({ economy }) => {
  const coin = economy.creatorCoin
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={coin.image}
            alt={coin.symbol}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{coin.symbol}</h3>
            <p className="text-sm text-gray-400">{coin.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">${coin.currentPrice.toFixed(4)}</p>
          <p className="text-sm text-gray-400">{coin.holderCount} holders</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div>
          <p className="text-gray-400">24h Volume</p>
          <p className="font-semibold">${(coin.volume24h / 1000).toFixed(1)}K</p>
        </div>
        <div>
          <p className="text-gray-400">Content Coins</p>
          <p className="font-semibold">{economy.contentCoins.length}</p>
        </div>
      </div>
    </Card>
  )
}

const CreatorCoinMiniCard: React.FC<{ economy: Economy }> = ({ economy }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <img
        src={economy.creatorCoin.image}
        alt={economy.creatorCoin.symbol}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-medium">{economy.creatorCoin.symbol}</p>
        <p className="text-sm text-gray-400">{economy.creatorCoin.holderCount} holders</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-semibold">${(economy.creatorCoin.volume24h / 1000).toFixed(1)}K</p>
      <p className="text-sm text-gray-400">24h volume</p>
    </div>
  </div>
)

const ContentCoinCard: React.FC<{ contentCoin: ContentCoin }> = ({ contentCoin }) => (
  <Card className="p-4">
    <div className="flex space-x-3">
      <img
        src={contentCoin.thumbnailURI || contentCoin.image}
        alt={contentCoin.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{contentCoin.name}</h4>
        <p className="text-sm text-gray-400">{contentCoin.properties.contentType}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm">Viral Score: {contentCoin.viralityScore}/100</span>
          <span className="font-semibold">${contentCoin.currentPrice.toFixed(3)}</span>
        </div>
      </div>
    </div>
  </Card>
)

const HoldingCard: React.FC<{ holding: any }> = ({ holding }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={holding.coin.image}
          alt={holding.coin.symbol}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="font-semibold">{holding.coin.symbol}</h3>
          <p className="text-sm text-gray-400">{holding.balance.toFixed(0)} coins</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">${holding.currentValue.toFixed(2)}</p>
        <p className={`text-sm ${
          holding.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {holding.unrealizedPnL >= 0 ? '+' : ''}{holding.unrealizedPnLPercent.toFixed(1)}%
        </p>
      </div>
    </div>
  </Card>
)