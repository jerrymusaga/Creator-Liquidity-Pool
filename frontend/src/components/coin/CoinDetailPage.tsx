
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, TrendingUp, TrendingDown, BarChart3,
  Target, Zap, Crown, Share,
  MessageCircle, Plus, Minus
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWallet } from '@/hooks/useWallet'
import { useZoraSDK } from '@/hooks/useZoraSDK'
import { CreatorCoin, User } from '@/types'

interface CoinDetailPageProps {
  coin?: CreatorCoin
  onBack?: () => void
}

export const CoinDetailPage: React.FC<CoinDetailPageProps> = ({ coin, onBack }) => {
  const { isConnected, networkConfig } = useWallet()
  const { buyCoin, sellCoin } = useZoraSDK()
  const [activeTab, setActiveTab] = useState<'overview' | 'trading' | 'social' | 'analytics'>('overview')
  const [tradeAmount, setTradeAmount] = useState(0.01)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [isTrading, setIsTrading] = useState(false)

  // Mock coin data if not provided
  const mockCoin: CreatorCoin = coin || {
    address: '0x123...abc',
    symbol: 'CREATOR',
    name: 'Creator Token',
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=creator',
    currentPrice: 0.0456,
    totalSupply: 1000000,
    holderCount: 234,
    volume24h: 12450,
    creator: {
      id: '1',
      username: 'cryptoartist',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoartist',
      isCreator: true,
      followers: 1542,
      bio: 'Digital artist creating the future of NFTs and Creator Coins',
      verificationStatus: 'verified',
      socialLinks: {
        twitter: '@cryptoartist',
        farcaster: '@cryptoartist',
        website: 'https://cryptoartist.com'
      }
    } as User,
    coinType: 'creator',
    cultureRank: 12,
  }

  const priceChange24h = (Math.random() - 0.3) * 50 // -15% to +35%
  const isPositive = priceChange24h >= 0
  const marketCap = mockCoin.currentPrice * mockCoin.totalSupply

  const handleTrade = async () => {
    if (!isConnected) {
      console.error('Connect wallet to trade')
      return
    }

    if (tradeAmount <= 0) {
      console.error('Invalid trade amount')
      return
    }

    setIsTrading(true)
    
    try {
      let success = false
      
      if (tradeType === 'buy') {
        success = await buyCoin(mockCoin.address, tradeAmount)
      } else {
        // For sell, we need to convert ETH amount to token amount
        // This is a simplified calculation - in production you'd get this from a quote
        const tokenAmount = tradeAmount / mockCoin.currentPrice
        success = await sellCoin(mockCoin.address, tokenAmount)
      }

      if (success) {
        console.log(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${mockCoin.symbol} successfully!`)
        // Optionally refresh data or update UI state here
      }
    } catch (error) {
      console.error('Trade failed:', error)
    } finally {
      setIsTrading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <img
                src={mockCoin.image}
                alt={mockCoin.name}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h1 className="font-bold">{mockCoin.symbol}</h1>
                <p className="text-sm text-gray-400">{mockCoin.name}</p>
              </div>
            </div>
            <div className="flex-1" />
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Price Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img
              src={mockCoin.image}
              alt={mockCoin.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold">{mockCoin.symbol}</h1>
              <p className="text-gray-400">{mockCoin.name}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold">${mockCoin.currentPrice.toFixed(4)}</p>
              <div className={`flex items-center justify-center text-lg ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-blue">${(marketCap / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-400">Market Cap</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-green">${(mockCoin.volume24h / 1000).toFixed(0)}K</p>
              <p className="text-sm text-gray-400">Volume 24h</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-purple">{mockCoin.holderCount}</p>
              <p className="text-sm text-gray-400">Holders</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-vibe-pink">#{mockCoin.cultureRank}</p>
              <p className="text-sm text-gray-400">Culture Rank</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'trading', label: 'Trading', icon: TrendingUp },
              { id: 'social', label: 'Social', icon: MessageCircle },
              { id: 'analytics', label: 'Analytics', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-vibe-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* About Creator */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">About the Creator</h2>
                  <div className="flex items-start space-x-4">
                    <img
                      src={mockCoin.creator.avatar}
                      alt={mockCoin.creator.username}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold">{mockCoin.creator.username}</h3>
                        <Crown className="w-5 h-5 text-vibe-purple" />
                      </div>
                      <p className="text-gray-300 mb-3">{mockCoin.creator.bio}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{mockCoin.creator.followers?.toLocaleString()} followers</span>
                        <span>•</span>
                        <span>Joined 2023</span>
                        <span>•</span>
                        <span>Verified Creator</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* V4 Rewards Info */}
                <Card className="p-6 bg-gradient-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Zap className="w-6 h-6 text-vibe-green mr-3" />
                      <div>
                        <h3 className="font-semibold">V4 Auto Rewards</h3>
                        <p className="text-sm text-gray-400">Automatic reward distribution</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Creator Earnings</p>
                      <p className="text-lg font-bold text-vibe-green">50% of fees</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Platform Referral</p>
                      <p className="text-lg font-bold text-vibe-purple">15% of fees</p>
                    </div>
                  </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {[
                      { type: 'buy', user: 'trader_123', amount: '0.05 ETH', time: '2 minutes ago' },
                      { type: 'sell', user: 'crypto_fan', amount: '0.02 ETH', time: '15 minutes ago' },
                      { type: 'buy', user: 'nft_collector', amount: '0.1 ETH', time: '1 hour ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                          }`} />
                          <span className="font-medium">{activity.user}</span>
                          <span className={activity.type === 'buy' ? 'text-green-400' : 'text-red-400'}>
                            {activity.type === 'buy' ? 'bought' : 'sold'}
                          </span>
                          <span>{activity.amount}</span>
                        </div>
                        <span className="text-sm text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                
              </motion.div>
            )}

            {/* Other tabs would go here */}
          </div>

          {/* Trading Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 sticky top-32">
              <h2 className="text-xl font-bold mb-4">Trade {mockCoin.symbol}</h2>
              
              {/* Buy/Sell Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    tradeType === 'buy'
                      ? 'bg-green-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    tradeType === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTradeAmount(Math.max(0.001, tradeAmount - 0.01))}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center text-white focus:outline-none focus:border-vibe-purple"
                    step="0.001"
                    min="0.001"
                  />
                  <button
                    onClick={() => setTradeAmount(tradeAmount + 0.01)}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[0.01, 0.05, 0.1].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTradeAmount(amount)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      tradeAmount === amount
                        ? 'bg-vibe-purple text-white'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>

              {/* Estimated Coins */}
              <div className="bg-gray-800 rounded-lg p-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">You'll receive:</span>
                  <span className="font-semibold">
                    ~{(tradeAmount / mockCoin.currentPrice).toFixed(0)} {mockCoin.symbol}
                  </span>
                </div>
              </div>

              {/* Trade Button */}
              <Button
                onClick={handleTrade}
                disabled={!isConnected || tradeAmount <= 0 || isTrading}
                loading={isTrading}
                className={`w-full py-3 ${
                  tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {!isConnected 
                  ? 'Connect Wallet' 
                  : isTrading 
                    ? `${tradeType === 'buy' ? 'Buying' : 'Selling'}...`
                    : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${mockCoin.symbol}`
                }
              </Button>

              {/* Network Info */}
              <div className="mt-4 text-xs text-gray-400 text-center">
                Trading on {networkConfig.name}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}