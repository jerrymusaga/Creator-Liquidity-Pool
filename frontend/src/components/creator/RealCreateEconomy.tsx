'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, Zap, Crown, ArrowRight, 
  ExternalLink, Copy, CheckCircle,
  Coins, TrendingUp,DollarSign, Info
} from 'lucide-react'
import { parseEther} from 'viem'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CustomConnectButton } from '@/components/wallet/ConnectButton'
import { useWallet } from '@/hooks/useWallet'
import { useZoraSDK } from '@/hooks/useZoraSDK'
import toast from 'react-hot-toast'

interface RealCreateEconomyProps {
  onComplete?: (coinAddress: string) => void
}

interface CoinFormData {
  name: string
  symbol: string
  description: string
  image: string
  initialPurchase: string // ETH amount as string
}

export const RealCreateEconomy: React.FC<RealCreateEconomyProps> = ({ onComplete }) => {
  const { address, isConnected, isOnCorrectNetwork, networkConfig } = useWallet()
  const { createCoin, isCreating, estimateCreateCoinGas } = useZoraSDK()
  
  const [step, setStep] = useState<'connect' | 'form' | 'preview' | 'deploy' | 'success'>('connect')
  const [formData, setFormData] = useState<CoinFormData>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    initialPurchase: '0.001' // Default initial purchase
  })
  const [deployedCoinAddress, setDeployedCoinAddress] = useState<string>('')
  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null)

  // Auto advance to form when wallet connects and is on correct network
  React.useEffect(() => {
    if (isConnected && isOnCorrectNetwork && step === 'connect') {
      setStep('form')
    }
  }, [isConnected, isOnCorrectNetwork, step])

  // Estimate gas when form data changes
  React.useEffect(() => {
    if (formData.name && formData.symbol && formData.description) {
      estimateCreateCoinGas({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.image,
        initialPurchaseWei: parseEther(formData.initialPurchase)
      }).then(setGasEstimate)
    }
  }, [formData, estimateCreateCoinGas])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a coin name')
      return
    }
    if (!formData.symbol.trim()) {
      toast.error('Please enter a symbol')
      return
    }
    if (formData.symbol.length > 6) {
      toast.error('Symbol should be 6 characters or less')
      return
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }
    
    const purchaseAmount = parseFloat(formData.initialPurchase)
    if (isNaN(purchaseAmount) || purchaseAmount < 0.001) {
      toast.error('Initial purchase must be at least 0.001 ETH')
      return
    }
    if (purchaseAmount > 1) {
      toast.error('Initial purchase cannot exceed 1 ETH')
      return
    }

    setStep('preview')
  }

  const handleDeploy = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!isOnCorrectNetwork) {
      toast.error(`Please switch to ${networkConfig.name}`)
      return
    }

    setStep('deploy')
    
    try {
      const coinAddress = await createCoin({
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: formData.image,
        initialPurchaseWei: parseEther(formData.initialPurchase)
      })
      
      if (coinAddress) {
        setDeployedCoinAddress(coinAddress)
        setStep('success')
        onComplete?.(coinAddress)
      } else {
        setStep('preview')
      }
    } catch (error) {
      console.error('Deployment failed:', error)
      setStep('preview')
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(deployedCoinAddress)
    toast.success('Address copied!')
  }

  const estimatedTokens = () => {
    const ethAmount = parseFloat(formData.initialPurchase)
    // Rough estimate: 1 ETH ≈ 1M tokens (this would be calculated properly in production)
    return Math.floor(ethAmount * 1000000)
  }

  // Step 1: Connect Wallet
  if (step === 'connect') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-vibe rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Create Your Creator Coin</h1>
            <p className="text-gray-400 mb-8">
              Deploy a real Creator Coin on {networkConfig.name} with Zora V4 auto-rewards
            </p>

            <div className="grid grid-cols-1 gap-4 mb-6 text-sm">
              <div className="bg-vibe-purple/10 border border-vibe-purple/20 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-vibe-purple mr-2" />
                  <span className="font-semibold text-vibe-purple">V4 Auto Rewards</span>
                </div>
                <p className="text-gray-300">
                  Earn 50% of all trading fees automatically in ZORA tokens
                </p>
              </div>

              <div className="bg-vibe-green/10 border border-vibe-green/20 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 text-vibe-green mr-2" />
                  <span className="font-semibold text-vibe-green">Platform Referrals</span>
                </div>
                <p className="text-gray-300">
                  Vibe earns 15% referral fees to keep the platform running
                </p>
              </div>
            </div>

            <CustomConnectButton size="lg" />

            <p className="text-xs text-gray-500 mt-4">
              Will automatically switch to {networkConfig.name} if needed
            </p>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Step 2: Form
  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-vibe rounded-full flex items-center justify-center mr-3">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Launch Your Economy</h1>
              </div>
              <p className="text-gray-400">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)} • {networkConfig.name}
              </p>
            </div>

            {/* Form */}
            <Card className="p-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Coin Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Jake's Gaming Economy"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-vibe-purple focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      placeholder="e.g., JAKE"
                      maxLength={6}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-vibe-purple focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 6 characters</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your creator economy..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-vibe-purple focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-vibe-purple focus:border-transparent"
                  />
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Initial Purchase (ETH) *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="1.0"
                    value={formData.initialPurchase}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialPurchase: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-vibe-purple focus:border-transparent"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: 0.001 ETH • Max: 1.0 ETH</span>
                    <span>≈ {estimatedTokens().toLocaleString()} {formData.symbol || 'tokens'}</span>
                  </div>
                </div>

                {gasEstimate && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Info className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-sm font-medium text-blue-400">Gas Estimate</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Estimated gas: {gasEstimate.toString()} units
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Preview Coin
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Step 3: Preview
  if (step === 'preview') {
    const initialPurchaseValue = parseFloat(formData.initialPurchase)
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-2xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Preview Your Creator Coin</h1>
              <p className="text-gray-400">Review details before deploying to {networkConfig.name}</p>
            </div>

            {/* Preview Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={formData.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${formData.symbol}`}
                  alt={formData.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">{formData.name}</h2>
                  <p className="text-lg text-vibe-purple font-mono">${formData.symbol}</p>
                  <p className="text-sm text-gray-400">by {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{formData.description}</p>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Coins className="w-4 h-4 text-vibe-purple mr-1" />
                    <span className="text-xs text-gray-400">Initial Tokens</span>
                  </div>
                  <p className="font-semibold">{estimatedTokens().toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-vibe-green mr-1" />
                    <span className="text-xs text-gray-400">Your Investment</span>
                  </div>
                  <p className="font-semibold">{formData.initialPurchase} ETH</p>
                </div>
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-vibe-blue mr-1" />
                    <span className="text-xs text-gray-400">Your Earnings</span>
                  </div>
                  <p className="font-semibold text-vibe-blue">50%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-vibe-green/10 border border-vibe-green/20 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 text-vibe-green mr-2" />
                    <span className="font-semibold text-vibe-green">V4 Auto Rewards Enabled</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    You'll automatically earn 50% of all trading fees in ZORA tokens. No claiming required!
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Deployment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Network:</span>
                      <span className="ml-2">{networkConfig.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Currency:</span>
                      <span className="ml-2">ETH</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Platform Fee:</span>
                      <span className="ml-2">15% to Vibe</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Creator Fee:</span>
                      <span className="ml-2">50% to You</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                onClick={() => setStep('form')}
                variant="outline"
                className="flex-1"
              >
                Back to Edit
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={isCreating}
                className="flex-1"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Deploy Coin ({formData.initialPurchase} ETH)
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Step 4: Deploying (handled by isCreating state in preview)
  
  // Step 5: Success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Card className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
              className="w-20 h-20 bg-vibe-green rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold mb-4">🚀 Creator Coin Launched!</h2>
            <p className="text-gray-400 mb-6">
              Your ${formData.symbol} coin is now live on {networkConfig.name} with V4 auto-rewards enabled
            </p>

            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Contract Address</p>
              <div className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                <span className="font-mono text-sm">
                  {deployedCoinAddress.slice(0, 8)}...{deployedCoinAddress.slice(-8)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <Button
                onClick={() => window.open(`${networkConfig.explorerUrl}/address/${deployedCoinAddress}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on {networkConfig.explorerUrl.includes('basescan') ? 'BaseScan' : 'Explorer'}
              </Button>
            </div>

            <Button
              onClick={() => onComplete?.(deployedCoinAddress)}
              className="w-full"
              size="lg"
            >
              🎉 Share Your Coin
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  return null
}