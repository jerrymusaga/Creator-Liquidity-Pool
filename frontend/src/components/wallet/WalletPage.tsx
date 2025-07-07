'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, TrendingUp, TrendingDown, Coins, Users, Star,
  ArrowUpRight, ArrowDownLeft, Plus, Eye, EyeOff,
  Clock, Target, Zap, Crown, FireExtinguisher
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
import { useUserProfile, usePortfolioValue } from '@/hooks/useZoraProfile'
import { useWallet } from '@/hooks/useWallet'
import { CoinHolding, V4Transaction } from '@/types'

export const WalletPage: React.FC = () => {
  const { user } = useStore()
  const { address, isConnected, connectWallet } = useWallet()
  const { holdings, transactions } = useUserProfile(address)
  const { data: portfolioValue } = usePortfolioValue(address)
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions' | 'rewards'>('holdings')
  const [showBalances, setShowBalances] = useState(true)

  // Use real data from hooks, fallback to empty arrays
  const coinHoldings = holdings.data || []
  const userTransactions = transactions.data || []

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm w-full">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your Creator Coin portfolio
          </p>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  // Calculate portfolio totals
  const totalPortfolioValue = portfolioValue || 0
  const totalPnL = coinHoldings?.reduce((sum: number, holding: any) => sum + (holding.unrealizedPnL || 0), 0) || 0
  const totalPnLPercent = totalPortfolioValue > 0 ? (totalPnL / (totalPortfolioValue - totalPnL)) * 100 : 0

  // Get recent transactions
  const recentTransactions = userTransactions
    ?.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    ?.slice(0, 10) || []

  // Calculate today's rewards from V4
  const todayRewards = recentTransactions
    ?.filter((tx: any) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const txDate = new Date(tx.timestamp)
      return txDate >= today && (tx.type === 'buy' || tx.type === 'sell')
    })
    ?.reduce((sum: number, tx: any) => sum + (tx.tradeReferralReward || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Vibe Wallet</h1>
              <p className="text-sm text-gray-400">Your Creator Coin Portfolio</p>
            </div>
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Portfolio Summary */}
          <Card className="p-4 bg-gradient-card mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
              <p className="text-2xl font-bold mb-2">
                {showBalances ? `$${totalPortfolioValue.toFixed(2)}` : '•••••'}
              </p>
              <div className={`flex items-center justify-center text-sm ${
                totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {totalPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>
                  {showBalances 
                    ? `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)} (${totalPnLPercent.toFixed(1)}%)`
                    : '•••••'
                  }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <p className="text-sm text-gray-400">Holdings</p>
                <p className="font-semibold">{coinHoldings?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Today's Rewards</p>
                <p className="font-semibold text-vibe-green">
                  {showBalances ? `$${todayRewards.toFixed(4)}` : '••••'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="font-semibold">{Array.isArray(transactions) ? transactions.length : 0}</p>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <div className="flex bg-gray-800 rounded-xl p-1">
            {[
              { id: 'holdings', label: 'Holdings', icon: Coins },
              { id: 'transactions', label: 'Activity', icon: Clock },
              { id: 'rewards', label: 'Rewards', icon: Zap }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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
      <div className="px-4 py-4 space-y-4">
        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {!coinHoldings || coinHoldings.length === 0 ? (
              <Card className="p-8 text-center">
                <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Holdings Yet</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Start trading Creator Coins to build your portfolio
                </p>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Explore Creators
                </Button>
              </Card>
            ) : (
              coinHoldings?.map((holding: any) => (
                <CoinHoldingCard
                  key={holding.coinAddress}
                  holding={holding}
                  showBalance={showBalances}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {!recentTransactions || recentTransactions.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Activity Yet</h3>
                <p className="text-sm text-gray-400">
                  Your trading activity will appear here
                </p>
              </Card>
            ) : (
              Array.isArray(recentTransactions) ? recentTransactions.map((transaction: any) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  showAmount={showBalances}
                />
              )) : null
            )}
          </motion.div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* V4 Rewards Summary */}
            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-vibe-purple mr-3" />
                  <div>
                    <h3 className="font-semibold">V4 Auto Rewards</h3>
                    <p className="text-sm text-gray-400">Platform trading fees</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-vibe-purple">
                    {showBalances ? `$${todayRewards.toFixed(4)}` : '••••'}
                  </p>
                  <p className="text-xs text-gray-400">Today</p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                You earn 15% of trading fees when users trade via CLP platform
              </div>
            </Card>

            {/* Reward Breakdown */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Reward Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-vibe-blue mr-2" />
                    <span className="text-sm">Trade Referrals</span>
                  </div>
                  <span className="font-semibold">
                    {showBalances ? `$${todayRewards.toFixed(4)}` : '••••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 text-vibe-green mr-2" />
                    <span className="text-sm">Create Referrals</span>
                  </div>
                  <span className="font-semibold">
                    {showBalances ? '$0.00' : '••••'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-vibe-purple mr-2" />
                    <span className="text-sm">LP Rewards</span>
                  </div>
                  <span className="font-semibold">
                    {showBalances ? '$0.00' : '••••'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Claim Info */}
            <Card className="p-4 border-vibe-green/30">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-vibe-green mt-0.5" />
                <div>
                  <p className="font-medium text-vibe-green">Auto-Distributed</p>
                  <p className="text-sm text-gray-400 mt-1">
                    V4 rewards are automatically sent to your wallet in ZORA tokens. No claiming needed!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Coin Holding Card Component
const CoinHoldingCard: React.FC<{
  holding: CoinHolding
  showBalance: boolean
}> = ({ holding, showBalance }) => {
  const isProfit = holding.unrealizedPnL >= 0
  const coin = holding.coin

  const getBadge = () => {
    if (holding.coin.coinType === 'creator' && coin.cultureRank && coin.cultureRank <= 10) {
      return <Crown className="w-4 h-4 text-vibe-purple" />
    }
    if (holding.coin.coinType === 'content' && coin.viralityScore && coin.viralityScore > 80) {
      return <FireExtinguisher className="w-4 h-4 text-orange-400" />
    }
    return null
  }

  return (
    <Card className="p-4 hover:border-vibe-purple transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={coin.image}
              alt={coin.name}
              className="w-12 h-12 rounded-full"
            />
            {getBadge() && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                {getBadge()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{coin.symbol}</h3>
            <p className="text-sm text-gray-400">
              {coin.coinType === 'creator' ? coin.creator.username : coin.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">
            {showBalance ? `$${holding.currentValue.toFixed(2)}` : '••••'}
          </p>
          <div className={`flex items-center text-sm ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {isProfit ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>
              {showBalance 
                ? `${isProfit ? '+' : ''}${holding.unrealizedPnLPercent.toFixed(1)}%`
                : '••••'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div>
          <p className="text-gray-400">Balance</p>
          <p className="font-semibold">
            {showBalance ? holding.balance.toFixed(0) : '••••'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Avg Price</p>
          <p className="font-semibold">
            {showBalance ? `$${holding.averageBuyPrice.toFixed(4)}` : '••••'}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Current</p>
          <p className="font-semibold">
            {showBalance ? `$${holding.currentPrice.toFixed(4)}` : '••••'}
          </p>
        </div>
      </div>
    </Card>
  )
}

// Transaction Card Component
const TransactionCard: React.FC<{
  transaction: V4Transaction
  showAmount: boolean
}> = ({ transaction, showAmount }) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'buy':
        return <ArrowDownLeft className="w-5 h-5 text-green-400" />
      case 'sell':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />
      case 'create':
        return <Plus className="w-5 h-5 text-vibe-purple" />
      case 'reward_distribution':
        return <Zap className="w-5 h-5 text-vibe-green" />
      default:
        return <Coins className="w-5 h-5 text-gray-400" />
    }
  }

  const getTransactionLabel = () => {
    switch (transaction.type) {
      case 'buy':
        return 'Bought'
      case 'sell':
        return 'Sold'
      case 'create':
        return 'Created'
      case 'reward_distribution':
        return 'Rewards'
      default:
        return 'Transaction'
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-800 rounded-lg">
            {getTransactionIcon()}
          </div>
          <div>
            <p className="font-semibold text-sm">{getTransactionLabel()}</p>
            <p className="text-xs text-gray-400">
              {transaction.timestamp.toLocaleDateString()} • {transaction.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold">
            {showAmount 
              ? `${transaction.coinsAmount.toFixed(0)} coins`
              : '••••'
            }
          </p>
          <p className="text-xs text-gray-400">
            {showAmount 
              ? `$${transaction.totalValue.toFixed(4)}`
              : '••••'
            }
          </p>
        </div>
      </div>
      
      {/* V4 Rewards Info */}
      {(transaction.type === 'buy' || transaction.type === 'sell') && transaction.creatorReward > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Creator earned</span>
            <span className="text-vibe-green">
              {showAmount ? `$${transaction.creatorReward.toFixed(4)} ZORA` : '••••'}
            </span>
          </div>
          {transaction.tradeReferralReward > 0 && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-400">Platform earned</span>
              <span className="text-vibe-purple">
                {showAmount ? `$${transaction.tradeReferralReward.toFixed(4)} ZORA` : '••••'}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}