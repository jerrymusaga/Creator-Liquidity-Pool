
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Zap, Crown, Upload, 
  Check, AlertCircle, Loader2, ExternalLink,
  Globe, Hash, Share, Copy, User
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useFullCoinCreationWagmi } from '@/hooks/useZoraCoinCreationWagmi'
import { useWallet } from '@/hooks/useWallet'
import { IPFSUploadResult } from '@/lib/ipfs'
import { frameUtils } from '@/lib/frameUtils'
import { DeployCurrency } from '@zoralabs/coins-sdk'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface IPFSCoinCreationProps {
  onComplete?: () => void
  onBack?: () => void
}

interface CoinCreationResult {
  coinAddress: string
  transactionHash: string
}

interface CoinFormData {
  // Basic Info
  name: string
  symbol: string
  description: string
  
  // Image
  imageResult: IPFSUploadResult | null
  
  // Social & External
  website?: string
  twitter?: string
  farcaster?: string
  
  // Creator Settings
  currency: DeployCurrency
  platformReferrer?: string
}


export const IPFSCoinCreation: React.FC<IPFSCoinCreationProps> = ({ 
  onComplete, 
  onBack 
}) => {
  const { address, isConnected, connectWallet, isOnCorrectNetwork, networkConfig } = useWallet()
  const { createCoinWithMetadata, isLoading } = useFullCoinCreationWagmi()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [createdCoin, setCreatedCoin] = useState<CoinCreationResult | null>(null)
  // Set default currency based on network (Base mainnet uses ZORA, Base Sepolia uses ETH)
  const defaultCurrency = networkConfig.chain.id === 8453 ? DeployCurrency.ZORA : DeployCurrency.ETH;
  
  const [formData, setFormData] = useState<CoinFormData>({
    name: '',
    symbol: '',
    description: '',
    imageResult: null,
    currency: defaultCurrency,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation
  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNum === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required'
      if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required'
      if (formData.symbol.length > 10) newErrors.symbol = 'Symbol must be 10 characters or less'
      if (!formData.description.trim()) newErrors.description = 'Description is required'
    }

    if (stepNum === 2) {
      if (!formData.imageResult) newErrors.image = 'Image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form input changes
  const handleInputChange = (field: keyof CoinFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle image upload
  const handleImageUploaded = (result: IPFSUploadResult) => {
    handleInputChange('imageResult', result)
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    setStep(prev => prev - 1)
  }

  // Handle coin creation
  const handleCreateCoin = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet')
      return
    }

    if (!isOnCorrectNetwork) {
      toast.error(`Please switch to ${networkConfig.name}`)
      return
    }

    if (!validateStep(3)) return

    try {
      const coinData = {
        name: formData.name,
        symbol: formData.symbol,
        payoutRecipient: address,
        platformReferrer: formData.platformReferrer as `0x${string}` | undefined,
        currency: formData.currency,
      }

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.imageResult!.uri,
        external_url: formData.website,
        attributes: [
          { trait_type: 'Creator', value: address || 'Unknown' },
          { trait_type: 'Network', value: networkConfig.name },
        ],
        properties: {
          creator: address,
          social_links: {
            twitter: formData.twitter,
            farcaster: formData.farcaster,
            website: formData.website,
          },
        },
      }

      const result = await createCoinWithMetadata({
        coinData,
        metadata,
      })

      // Store the created coin result for sharing
      if (result?.address) {
        setCreatedCoin({
          coinAddress: result.address,
          transactionHash: result.hash || ''
        })
        setStep(5) // Go to sharing step
      } else {
        // Fallback: redirect to profile if no coin address
        onComplete?.()
        toast.success('Redirecting to your profile...', { duration: 2000 })
        setTimeout(() => {
          router.push('/profile')
        }, 1500)
      }
      
    } catch (error: any) {
      console.error('Coin creation failed:', error)
      toast.error(`Failed to create coin: ${error.message}`)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Basic Information'
      case 2: return 'Upload Image'
      case 3: return 'Social & Settings'
      case 4: return 'Review & Create'
      case 5: return 'Share Your Coin'
      default: return 'Create Coin'
    }
  }

  // Handle frame sharing
  const handleShareFrame = () => {
    if (!createdCoin?.coinAddress) return
    
    const frameUrl = frameUtils.generateShareableFrameUrl(createdCoin.coinAddress)
    navigator.clipboard.writeText(frameUrl)
    toast.success('Frame URL copied! Share it in Farcaster to let people trade your coin.')
  }

  const handleShareToWarpcast = () => {
    if (!createdCoin?.coinAddress) return
    
    const frameUrl = frameUtils.generateShareableFrameUrl(createdCoin.coinAddress)
    const shareText = `🎉 Just launched my Creator Coin: ${formData.symbol}! Trade it directly in this frame 🪙`
    const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrl, shareText)
    window.open(warpcastUrl, '_blank')
  }

  const handleViewCoin = () => {
    if (!createdCoin?.coinAddress) return
    // Navigate to coin detail page or external explorer
    window.open(`https://basescan.org/address/${createdCoin.coinAddress}`, '_blank')
  }

  const handleGoToProfile = () => {
    onComplete?.()
    router.push('/profile')
  }

  // Wallet connection validation - same pattern as profile and wallet tabs
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-2 sm:p-4">
        <Card className="p-4 sm:p-6 lg:p-8 text-center max-w-sm w-full">
          <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-6">
            Connect your wallet to create your Creator Coin
          </p>
          <Button onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button onClick={onBack} variant="outline" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate">Create Creator Coin</h1>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{getStepTitle()}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div
                  key={num}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                    num <= step 
                      ? 'bg-vibe-purple text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {num < step ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-vibe-purple mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Let's Create Your Creator Coin</h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Start by providing basic information about your coin
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coin Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., CryptoArtist Coin"
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple ${
                      errors.name ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Symbol <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                    placeholder="e.g., CART"
                    maxLength={10}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple ${
                      errors.symbol ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.symbol && (
                    <p className="text-red-400 text-sm mt-1">{errors.symbol}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    {formData.symbol.length}/10 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your creator coin, what it represents, and what value it provides to holders..."
                    rows={4}
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-700'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!formData.name || !formData.symbol || !formData.description}
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Next: Upload Image</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload Image */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-vibe-purple mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Upload Your Coin Image</h2>
                <p className="text-sm sm:text-base text-gray-400">
                  This image will represent your creator coin across the platform
                </p>
              </div>

              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onImageRemoved={() => handleInputChange('imageResult', null)}
                className="max-w-full sm:max-w-md mx-auto"
                required
              />

              {errors.image && (
                <div className="text-center mt-4">
                  <p className="text-red-400 text-sm">{errors.image}</p>
                </div>
              )}
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <Button onClick={handlePrevious} variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={!formData.imageResult} className="w-full sm:w-auto order-1 sm:order-2">
                <span className="hidden sm:inline">Next: Social Links</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Social & Settings */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Hash className="w-12 h-12 sm:w-16 sm:h-16 text-vibe-purple mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Social Links & Settings</h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Add your social links and choose settings
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Category Selection */}

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="font-medium">Social Links (Optional)</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Hash className="w-4 h-4 inline mr-2" />
                      Farcaster
                    </label>
                    <input
                      type="text"
                      value={formData.farcaster || ''}
                      onChange={(e) => handleInputChange('farcaster', e.target.value)}
                      placeholder="@username"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-vibe-purple"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <Button onClick={handlePrevious} variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext} className="w-full sm:w-auto order-1 sm:order-2">
                <span className="hidden sm:inline">Next: Review</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review & Create */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-vibe-green mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Review & Create</h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Review your coin details before creating
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                  {formData.imageResult && (
                    <img
                      src={formData.imageResult.url}
                      alt={formData.name}
                      className="w-16 h-16 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold">{formData.symbol}</h3>
                    <p className="text-sm sm:text-base text-gray-400">{formData.name}</p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-300 mb-4">{formData.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="ml-2 font-medium">{networkConfig.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Currency:</span>
                    <span className="ml-2 font-medium">
                      {formData.currency === DeployCurrency.ETH ? 'ETH' : 'ZORA'}
                    </span>
                  </div>
                  {formData.website && (
                    <div>
                      <span className="text-gray-400">Website:</span>
                      <span className="ml-2 font-medium">{formData.website}</span>
                    </div>
                  )}
                  {formData.imageResult && (
                    <div>
                      <span className="text-gray-400">Image:</span>
                      <span className="ml-2 font-medium text-vibe-green">Uploaded to IPFS</span>
                    </div>
                  )}
                </div>
              </div>

              {/* V4 Rewards Info */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 text-green-400 mr-2" />
                  <h3 className="font-medium text-green-400">V4 Auto Rewards Enabled</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Your coin will automatically participate in Zora V4 rewards. You'll earn 50% of all trading fees!
                </p>
              </div>

              {/* Wallet Connection Check */}
              {!isConnected && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <span className="text-red-400">Wallet not connected</span>
                    </div>
                    <Button onClick={connectWallet} size="sm">
                      Connect Wallet
                    </Button>
                  </div>
                </div>
              )}

              {/* Network Check */}
              {isConnected && !isOnCorrectNetwork && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-400">
                      Please switch to {networkConfig.name} to create your coin
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <Button onClick={handlePrevious} variant="outline" className="w-full sm:w-auto order-2 sm:order-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleCreateCoin}
                disabled={!isConnected || !isOnCorrectNetwork || isLoading}
                className="bg-gradient-vibe hover:opacity-90 w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Creating Coin...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Create Coin
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Share Your Coin */}
        {step === 5 && createdCoin && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-vibe-green mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">🎉 Coin Created Successfully!</h2>
                <p className="text-sm sm:text-base text-gray-400 mb-4">
                  Your Creator Coin <strong>{formData.symbol}</strong> is now live on Base!
                </p>
                
                {/* Coin Address */}
                <div className="bg-gray-800 rounded-lg p-3 mb-6">
                  <p className="text-xs text-gray-400 mb-1">Coin Address:</p>
                  <p className="font-mono text-sm text-green-400 break-all">{createdCoin.coinAddress}</p>
                </div>
              </div>

              {/* Share as Frame - Most Important */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 sm:p-6 mb-6 border border-purple-500/20">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <Zap className="w-5 h-5 text-purple-400 mr-2" />
                  Share as Interactive Frame
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Create an interactive trading card that works directly in Farcaster feeds. People can trade your coin without leaving their social feed!
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleShareToWarpcast}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share to Warpcast
                  </Button>
                  
                  <Button
                    onClick={handleShareFrame}
                    variant="outline"
                    className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Frame URL
                  </Button>
                </div>
              </div>

              {/* Other Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleViewCoin}
                  variant="outline"
                  className="border-green-500 text-green-400 hover:bg-green-500/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
                
                <Button
                  onClick={handleGoToProfile}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Go to Profile
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}