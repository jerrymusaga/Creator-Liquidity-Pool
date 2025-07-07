'use client'

import React, { useState, useEffect } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Zap, 
  AlertCircle, CheckCircle, Loader2, 
  Share2, ExternalLink 
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { frameTradingService, frameTradeHelpers } from '@/lib/frameTrading'
import { getCoin } from '@zoralabs/coins-sdk'

interface FrameTradingCardProps {
  coinAddress: string
  tradeType?: 'buy' | 'sell'
  initialAmount?: string
  onTradeComplete?: (result: any) => void
  compact?: boolean
}

export const FrameTradingCard: React.FC<FrameTradingCardProps> = ({
  coinAddress,
  tradeType = 'buy',
  initialAmount = '0.01',
  onTradeComplete,
  compact = false
}) => {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [coinData, setCoinData] = useState<any>(null)
  const [amount, setAmount] = useState(initialAmount)
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [activeTradeType, setActiveTradeType] = useState(tradeType)

  // Load coin data
  useEffect(() => {
    loadCoinData()
  }, [coinAddress])

  // Get quote when amount or trade type changes
  useEffect(() => {
    if (amount && coinData) {
      getQuote()
    }
  }, [amount, activeTradeType, coinData])

  const loadCoinData = async () => {
    try {
      const result = await getCoin({ 
        coinAddress: coinAddress as `0x${string}`,
        chainId: 8453 
      })
      setCoinData(result?.coin)
    } catch (err) {
      console.error('Failed to load coin data:', err)
      setError('Failed to load coin data')
    }
  }

  const getQuote = async () => {
    if (!amount || !address) return

    try {
      const validation = frameTradingService.validateTradeParams({
        coinAddress,
        tradeType: activeTradeType,
        amount,
        userAddress: address
      })

      if (!validation.valid) {
        setError(validation.error || 'Invalid trade parameters')
        return
      }

      const quoteResult = await frameTradingService.getTradeQuote({
        coinAddress,
        tradeType: activeTradeType,
        amount,
        userAddress: address
      })

      setQuote(quoteResult)
      setError('')
    } catch (err) {
      console.error('Quote failed:', err)
      setQuote(null)
    }
  }

  const executeTrade = async () => {
    if (!isConnected || !walletClient || !address) {
      setError('Please connect your wallet')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await frameTradingService.executeTrade(
        {
          coinAddress,
          tradeType: activeTradeType,
          amount,
          userAddress: address
        },
        walletClient,
        { address }
      )

      if (result.success) {
        setSuccess(`Trade completed! TX: ${result.transactionHash}`)
        onTradeComplete?.(result)
      } else {
        setError(result.error || 'Trade failed')
      }
    } catch (err) {
      console.error('Trade execution failed:', err)
      setError(err instanceof Error ? err.message : 'Trade failed')
    } finally {
      setIsLoading(false)
    }
  }

  const shareToFrame = () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    const frameUrl = `${baseUrl}/api/frames/coin/${coinAddress}`
    
    // Copy frame URL to clipboard
    navigator.clipboard.writeText(frameUrl)
    setSuccess('Frame URL copied to clipboard!')
  }

  const formatPrice = (price: number) => frameTradeHelpers.formatPrice(price)
  const formatAmount = (amount: string) => frameTradeHelpers.formatAmount(amount)

  if (!coinData) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2"></div>
      </Card>
    )
  }

  const price = coinData.currentPrice ? parseFloat(coinData.currentPrice) : 0
  const isPositive = true // You could calculate price change here

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className={`p-6 bg-gradient-to-br from-gray-800 to-gray-900 border-purple-500/30 ${
        compact ? 'max-w-md' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-xl">🪙</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{coinData.symbol}</h3>
              <p className="text-gray-400 text-sm">{coinData.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatPrice(price)}
            </div>
            <div className={`flex items-center text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {isPositive ? '+' : ''}5.2%
            </div>
          </div>
        </div>

        {/* Trade Type Toggle */}
        <div className="flex bg-gray-700 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTradeType('buy')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTradeType === 'buy'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🟢 Buy
          </button>
          <button
            onClick={() => setActiveTradeType('sell')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTradeType === 'sell'
                ? 'bg-red-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔴 Sell
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount ({activeTradeType === 'buy' ? 'ETH' : coinData.symbol})
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="0.01"
              step="0.001"
              min="0"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex space-x-2 mt-2">
            {activeTradeType === 'buy' 
              ? ['0.01', '0.05', '0.1'].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`px-3 py-1 rounded text-xs transition-all ${
                      amount === quickAmount
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {quickAmount} ETH
                  </button>
                ))
              : ['25%', '50%', '100%'].map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => {
                      // You'd calculate based on user's balance here
                      setAmount('100')
                    }}
                    className="px-3 py-1 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded text-xs transition-all"
                  >
                    {percentage}
                  </button>
                ))
            }
          </div>
        </div>

        {/* Quote Display */}
        {quote && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">
                You'll {activeTradeType === 'buy' ? 'receive' : 'get'}:
              </span>
              <span className="font-semibold text-white">
                {activeTradeType === 'buy' 
                  ? `~${formatAmount(quote.amountOut)} ${coinData.symbol}`
                  : `~${formatAmount(quote.amountOut)} ETH`
                }
              </span>
            </div>
            {quote.priceImpact > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400 text-xs">Price Impact:</span>
                <span className={`text-xs ${
                  quote.priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 text-green-400 text-sm mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={executeTrade}
            disabled={!isConnected || isLoading || !amount || parseFloat(amount) <= 0}
            className={`w-full py-3 font-semibold ${
              activeTradeType === 'buy' 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {activeTradeType === 'buy' ? 'Buy' : 'Sell'} {coinData.symbol}
              </>
            )}
          </Button>

          {/* Frame Actions */}
          <div className="flex space-x-2">
            <Button
              onClick={shareToFrame}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Frame
            </Button>
            <Button
              onClick={() => window.open(`/coin/${coinAddress}`, '_blank')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Details
            </Button>
          </div>
        </div>

        {/* Network Info */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Trading on Base • Powered by Zora Protocol
        </div>
      </Card>
    </motion.div>
  )
}