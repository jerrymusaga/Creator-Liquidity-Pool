'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Economy, Perk } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Coins, Users, TrendingUp} from 'lucide-react'
import { useStore } from '@/stores/useStore'
import toast from 'react-hot-toast'
import { mockPerks } from '@/lib/mockData'
interface EconomyPageProps {
  economy: Economy
  onBack: () => void
}
export const EconomyPage: React.FC<EconomyPageProps> = ({ economy, onBack }) => {
  const { user, addTransaction } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [tradeAmount, setTradeAmount] = useState(0)
  const [investAmount, setInvestAmount] = useState(0)
  const handleTrade = () => {
    if (!user) {
      toast.error('Please login first!')
      return
    }
    if (tradeAmount <= 0) {
      toast.error('Enter a valid amount!')
      return
    }

const transaction = {
  id: Date.now().toString(),
  type: 'trade' as const,
  userId: user.id,
  economyId: economy.id,
  amount: tradeAmount,
  tokenSymbol: economy.tokenSymbol,
  timestamp: new Date(),
}

addTransaction(transaction)
toast.success(`Traded ${tradeAmount} ${economy.tokenSymbol}!`)
setTradeAmount(0)

  }
  const handleInvest = () => {
    if (!user) {
      toast.error('Please login first!')
      return
    }
    if (investAmount <= 0) {
      toast.error('Enter a valid amount!')
      return
    }

const transaction = {
  id: Date.now().toString(),
  type: 'invest' as const,
  userId: user.id,
  economyId: economy.id,
  amount: investAmount,
  tokenSymbol: economy.tokenSymbol,
  timestamp: new Date(),
}

addTransaction(transaction)
toast.success(`Invested ${investAmount} ${economy.tokenSymbol}!`)
setInvestAmount(0)

  }
  const handlePerkPurchase = (perk: Perk) => {
    if (!user) {
      toast.error('Please login first!')
      return
    }
    if (!perk.available) {
      toast.error('Perk not available!')
      return
    }

const transaction = {
  id: Date.now().toString(),
  type: 'reward' as const,
  userId: user.id,
  economyId: economy.id,
  amount: perk.cost,
  tokenSymbol: economy.tokenSymbol,
  timestamp: new Date(),
}

addTransaction(transaction)
toast.success(`Unlocked ${perk.title}!`)

  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-6"
    >
      <Button variant="secondary" onClick={onBack} className="mb-6">
        Back
      </Button>

  {/* Header */}
  <Card neonBorder className="mb-6">
    <div className="relative h-64 rounded-lg overflow-hidden mb-4">
      <img
        src={economy.image}
        alt={economy.name}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex items-center space-x-3 mb-4">
      <img
        src={economy.creator.avatar}
        alt={economy.creator.username}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h2 className="text-2xl font-bold">{economy.name}</h2>
        <p className="text-gray-400">by {economy.creator.username}</p>
      </div>
    </div>
    <p className="text-gray-300 mb-4">{economy.description}</p>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="flex items-center justify-center mb-1">
          <Coins className="w-4 h-4 text-vibe-purple mr-1" />
          <span className="text-xs">Price</span>
        </div>
        <p className="font-semibold">${economy.currentPrice}</p>
      </div>
      <div>
        <div className="flex items-center justify-center mb-1">
          <Users className="w-4 h-4 text-vibe-blue mr-1" />
          <span className="text-xs">NFTs</span>
        </div>
        <p className="font-semibold">{economy.nftsMinted}</p>
      </div>
      <div>
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="w-4 h-4 text-vibe-green mr-1" />
          <span className="text-xs">Pool</span>
        </div>
        <p className="font-semibold">${economy.liquidityPool}</p>
      </div>
    </div>
  </Card>

  {/* Tabs */}
  <div className="flex space-x-4 mb-6 border-b border-gray-800">
    {['overview', 'trade', 'invest', 'perks'].map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`pb-2 capitalize text-sm font-medium ${
          activeTab === tab
            ? 'text-vibe-purple border-b-2 border-vibe-purple'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>

  {/* Content */}
  {activeTab === 'overview' && (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold">About this Vibe</h3>
      <p className="text-gray-300">{economy.description}</p>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Supply</span>
          <span>{economy.totalSupply.toLocaleString()} {economy.tokenSymbol}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Earnings</span>
          <span>${economy.totalEarnings.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Created</span>
          <span>{economy.createdAt.toLocaleDateString()}</span>
        </div>
      </div>
      <Button className="w-full" onClick={() => setActiveTab('trade')}>
        Join Now
      </Button>
    </Card>
  )}

  {activeTab === 'trade' && (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold">Trade {economy.tokenSymbol}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amount</label>
          <input
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(Number(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-vibe-purple"
            placeholder="Enter amount"
          />
        </div>
        <p className="text-sm text-gray-400">
          Estimated Value: ${(tradeAmount * economy.currentPrice).toFixed(2)}
        </p>
        <Button className="w-full" onClick={handleTrade}>
          Trade Now
        </Button>
      </div>
    </Card>
  )}

  {activeTab === 'invest' && (
    <Card className="space-y-4">
      <h3 className="text-lg font-semibold">Invest in {economy.tokenSymbol}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Amount</label>
          <input
            type="number"
            value={investAmount}
            onChange={(e) => setInvestAmount(Number(e.target.value))}
            className="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-vibe-purple"
            placeholder="Enter amount"
          />
        </div>
        <p className="text-sm text-gray-400">
          Estimated LP Reward: ${(investAmount * 0.001).toFixed(2)}/day
        </p>
        <Button className="w-full" onClick={handleInvest}>
          Invest Now
        </Button>
      </div>
    </Card>
  )}

  {activeTab === 'perks' && (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Perks</h3>
      {mockPerks
        .filter((perk) => perk.economyId === economy.id)
        .map((perk) => (
          <Card key={perk.id} className="flex items-center space-x-4">
            <div className="text-2xl">{perk.icon}</div>
            <div className="flex-1">
              <h4 className="font-semibold">{perk.title}</h4>
              <p className="text-sm text-gray-400">{perk.description}</p>
              <p className="text-sm text-vibe-purple">
                {perk.cost} {economy.tokenSymbol}
              </p>
            </div>
            <Button
              size="sm"
              variant={perk.available ? 'primary' : 'secondary'}
              onClick={() => handlePerkPurchase(perk)}
              disabled={!perk.available}
            >
              {perk.available ? 'Unlock' : 'Sold Out'}
            </Button>
          </Card>
        ))}
    </div>
  )}
</motion.div>

  )
}

