// components/creator/IPFSCoinCreation.tsx
'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, Zap, Crown, Upload, 
  Check, AlertCircle, Loader2, Eye, ExternalLink,
  Twitter, Globe, Hash
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useFullCoinCreation } from '@/hooks/useZoraCoinCreation'
import { useWallet } from '@/hooks/useWallet'
import { IPFSUploadResult } from '@/lib/ipfs'
import { DeployCurrency } from '@zoralabs/coins-sdk'
import toast from 'react-hot-toast'

interface IPFSCoinCreationProps {
  onComplete?: () => void
  onBack?: () => void
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
  category: string
  currency: DeployCurrency
  platformReferrer?: string
}

const CATEGORIES = [
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#8B5CF6' },
  { id: 'art', name: 'Art', icon: '🎨', color: '#EC4899' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#10B981' },
  { id: 'content', name: 'Content', icon: '📹', color: '#F59E0B' },
  { id: 'tech', name: 'Tech', icon: '💻', color: '#3B82F6' },
  { id: 'fitness', name: 'Fitness', icon: '💪', color: '#EF4444' },
]

export const IPFSCoinCreation: React.FC<IPFSCoinCreationProps> = ({ 
  onComplete, 
  onBack 
}) => {
  const { address, isConnected, connectWallet, isOnCorrectNetwork, networkConfig } = useWallet()
  const { createCoinWithMetadata, isLoading } = useFullCoinCreation()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CoinFormData>({
    name: '',
    symbol: '',
    description: '',
    imageResult: null,
    category: 'content',
    currency: DeployCurrency.ZORA,
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
        platformReferrer: formData.platformReferrer,
        currency: formData.currency,
      }

      const metadata = {
        name: formData.name,
        description: formData.description,
        image: formData.imageResult!.uri,
        external_url: formData.website,
        attributes: [
          { trait_type: 'Category', value: formData.category },
          { trait_type: 'Creator', value: address || 'Unknown' },
          { trait_type: 'Network', value: networkConfig.name },
        ],
        properties: {
          category: formData.category,
          creator: address,
          social_links: {
            twitter: formData.twitter,
            farcaster: formData.farcaster,
            website: formData.website,
          },
        },
      }

      await createCoinWithMetadata({
        coinData,
        metadata,
      })

      // Success handled by the hook
      onComplete?.()
      
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
      default: return 'Create Coin'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Create Creator Coin</h1>
                <p className="text-sm text-gray-400">{getStepTitle()}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    num <= step 
                      ? 'bg-vibe-purple text-white' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {num < step ? <Check className="w-4 h-4" /> : num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="p-8">
              <div className="text-center mb-8">
                <Crown className="w-16 h-16 text-vibe-purple mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Let's Create Your Creator Coin</h2>
                <p className="text-gray-400">
                  Start by providing basic information about your coin
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Coin Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., CryptoArtist Coin"
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple ${
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
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple ${
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
                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple resize-none ${
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
              <Button onClick={handleNext} disabled={!formData.name || !formData.symbol || !formData.description}>
                Next: Upload Image
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
            <Card className="p-8">
              <div className="text-center mb-8">
                <Upload className="w-16 h-16 text-vibe-purple mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Upload Your Coin Image</h2>
                <p className="text-gray-400">
                  This image will represent your creator coin across the platform
                </p>
              </div>

              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onImageRemoved={() => handleInputChange('imageResult', null)}
                className="max-w-md mx-auto"
                required
              />

              {errors.image && (
                <div className="text-center mt-4">
                  <p className="text-red-400 text-sm">{errors.image}</p>
                </div>
              )}
            </Card>

            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext} disabled={!formData.imageResult}>
                Next: Social Links
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
            <Card className="p-8">
              <div className="text-center mb-8">
                <Hash className="w-16 h-16 text-vibe-purple mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Social Links & Settings</h2>
                <p className="text-gray-400">
                  Add your social links and choose settings
                </p>
              </div>

              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleInputChange('category', category.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.category === category.id
                            ? 'border-vibe-purple bg-vibe-purple/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <p className="font-medium">{category.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Twitter className="w-4 h-4 inline mr-2" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={formData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple"
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-vibe-purple"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button onClick={handleNext}>
                Next: Review
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
            <Card className="p-8">
              <div className="text-center mb-8">
                <Zap className="w-16 h-16 text-vibe-green mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Review & Create</h2>
                <p className="text-gray-400">
                  Review your coin details before creating
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  {formData.imageResult && (
                    <img
                      src={formData.imageResult.url}
                      alt={formData.name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{formData.symbol}</h3>
                    <p className="text-gray-400">{formData.name}</p>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{formData.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <span className="ml-2 font-medium">
                      {CATEGORIES.find(c => c.id === formData.category)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="ml-2 font-medium">{networkConfig.name}</span>
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

            <div className="flex justify-between">
              <Button onClick={handlePrevious} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleCreateCoin}
                disabled={!isConnected || !isOnCorrectNetwork || isLoading}
                className="bg-gradient-vibe hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Coin...
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
      </div>
    </div>
  )
}