'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FrameTradingCard } from '@/components/frames/FrameTradingCard'
import { frameUtils } from '@/lib/frameUtils'
import { Copy, ExternalLink, Share2 } from 'lucide-react'

export default function FrameDemoPage() {
  const [selectedCoin, setSelectedCoin] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [copyMessage, setCopyMessage] = useState<string>('')

  // Example coin addresses for testing
  const exampleCoins = [
    {
      name: 'Creator Coin Example 1',
      symbol: 'CREATE1',
      address: '0x4e93a01c90f812284f71291a8d1415a904957156',
      description: 'Example creator coin for frame testing'
    },
    {
      name: 'Creator Coin Example 2', 
      symbol: 'CREATE2',
      address: '0x9b13358e3a023507e7046c18f508a958cda75f54',
      description: 'Another example creator coin'
    }
  ]

  const generateShareUrl = (coinAddress: string) => {
    const frameUrl = frameUtils.generateShareableFrameUrl(coinAddress)
    setShareUrl(frameUrl)
    return frameUrl
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    setCopyMessage(message)
    setTimeout(() => setCopyMessage(''), 3000)
  }

  const shareToWarpcast = (coinAddress: string) => {
    const frameUrl = generateShareUrl(coinAddress)
    const warpcastUrl = frameUtils.generateWarpcastShareUrl(
      frameUrl, 
      'Check out this creator coin! Trade directly in this frame 🪙'
    )
    window.open(warpcastUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🖼️ Farcaster Frame Trading Demo
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience trading creator coins directly within Farcaster frames. 
            Select a coin below to see the interactive trading interface.
          </p>
        </motion.div>

        {/* Coin Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">Select a Creator Coin to Demo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleCoins.map((coin) => (
                <motion.div
                  key={coin.address}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      selectedCoin === coin.address 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-gray-700 hover:border-purple-400'
                    }`}
                    onClick={() => setSelectedCoin(coin.address)}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                        🪙
                      </div>
                      <div>
                        <h3 className="font-bold">{coin.symbol}</h3>
                        <p className="text-sm text-gray-400">{coin.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{coin.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Trading Interface */}
        {selectedCoin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Trading Card */}
            <div>
              <h3 className="text-xl font-bold mb-4">Interactive Trading Interface</h3>
              <FrameTradingCard
                coinAddress={selectedCoin}
                onTradeComplete={(result) => {
                  console.log('Trade completed:', result)
                }}
                compact={true}
              />
            </div>

            {/* Frame Sharing */}
            <div>
              <h3 className="text-xl font-bold mb-4">Frame Sharing & Integration</h3>
              <Card className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Frame URL</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareUrl || generateShareUrl(selectedCoin)}
                      readOnly
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(shareUrl || generateShareUrl(selectedCoin), 'Frame URL copied!')}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => shareToWarpcast(selectedCoin)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share to Warpcast
                  </Button>

                  <Button
                    onClick={() => window.open(shareUrl || generateShareUrl(selectedCoin), '_blank')}
                    variant="outline"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Frame
                  </Button>
                </div>

                {copyMessage && (
                  <div className="text-green-400 text-sm text-center">
                    ✅ {copyMessage}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        )}

        {/* Features Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
            <h2 className="text-2xl font-bold mb-6 text-center">
              🚀 Frame Trading Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold mb-2">Instant Trading</h3>
                <p className="text-gray-400 text-sm">
                  Buy and sell creator coins directly within Farcaster frames without leaving the platform
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="font-bold mb-2">Seamless Integration</h3>
                <p className="text-gray-400 text-sm">
                  Powered by Zora SDK with automatic routing and slippage protection
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="font-bold mb-2">Secure & Gasless</h3>
                <p className="text-gray-400 text-sm">
                  EIP-2612 permit signatures for secure, gasless token approvals
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        {!selectedCoin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="p-6 bg-blue-500/10 border-blue-500/30">
              <h3 className="text-lg font-bold mb-3 text-blue-400">
                📋 How to Test Frame Trading
              </h3>
              <ol className="space-y-2 text-gray-300">
                <li>1. Select a creator coin from the options above</li>
                <li>2. Connect your wallet to test trading functionality</li>
                <li>3. Try buying/selling with different amounts</li>
                <li>4. Share the frame URL to Warpcast to test in Farcaster</li>
                <li>5. Experience native trading within social feeds</li>
              </ol>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}