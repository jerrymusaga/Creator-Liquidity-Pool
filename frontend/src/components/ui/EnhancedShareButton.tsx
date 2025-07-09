import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cast, Share, Sparkles, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import { shareCoinsAsFrame, shareCoinsAsFrameAdvanced, detectFarcasterContext } from '@/lib/universalFrameShare'
import { frameUtils } from '@/lib/frameUtils'
import toast from 'react-hot-toast'

interface EnhancedShareButtonProps {
  coin: any
  message?: string
  rank?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'trending' | 'minimal'
  showPreview?: boolean
  context?: 'trending' | 'discovery' | 'success' | 'custom'
  className?: string
}

export const EnhancedShareButton: React.FC<EnhancedShareButtonProps> = ({
  coin,
  message,
  rank,
  size = 'md',
  variant = 'primary',
  showPreview = false,
  context = 'custom',
  className = ''
}) => {
  const [isSharing, setIsSharing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const farcasterContext = detectFarcasterContext()
  const isInFarcaster = farcasterContext !== 'external'

  const handleShare = async (shareMethod: 'auto' | 'warpcast' | 'copy' | 'advanced' = 'auto') => {
    setIsSharing(true)
    try {
      if (shareMethod === 'advanced') {
        await shareCoinsAsFrameAdvanced(coin, {
          message,
          context,
          rank,
          includeStats: true
        })
      } else if (shareMethod === 'warpcast') {
        const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
        const shareMessage = message || getShareMessage(coin, rank, context)
        const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrl, shareMessage)
        window.open(warpcastUrl, '_blank', 'noopener,noreferrer')
        toast.success('Opening Warpcast to share frame...', { duration: 3000 })
      } else if (shareMethod === 'copy') {
        const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
        const shareMessage = message || getShareMessage(coin, rank, context)
        await navigator.clipboard.writeText(`${shareMessage}\n\n${frameUrl}`)
        toast.success(
          <div>
            <p><strong>Frame URL copied!</strong></p>
            <p className="text-sm mt-1">Paste in Farcaster to share interactive trading card</p>
          </div>,
          { duration: 5000 }
        )
      } else {
        const shareMessage = message || getShareMessage(coin, rank, context)
        await shareCoinsAsFrame(coin, shareMessage)
      }

      // Show success state briefly
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
      
    } catch (error) {
      console.error('Share failed:', error)
      toast.error('Failed to share frame. Please try again.')
    } finally {
      setIsSharing(false)
      setShowOptions(false)
    }
  }

  const getShareMessage = (coin: any, rank?: number, context?: string) => {
    if (context === 'trending' && rank && rank <= 3) {
      return `🏆 #${rank} trending creator coin: ${coin.symbol} is absolutely crushing it! Don't miss this momentum`
    }
    if (context === 'trending' && rank && rank <= 10) {
      return `🔥 #${rank} trending: ${coin.symbol} is gaining serious traction! Trade directly below`
    }
    if (context === 'discovery') {
      return `💎 Hidden gem: ${coin.symbol} discovered! Early opportunity with huge potential`
    }
    if (context === 'success') {
      return `✅ Just traded ${coin.symbol}! Join the momentum and trade directly in this frame`
    }
    return `💎 Check out ${coin.symbol} - trending creator coin with huge potential! Trade instantly`
  }

  const getButtonSizes = () => {
    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }
    return sizes[size]
  }

  const getButtonVariant = () => {
    const variants = {
      primary: `
        bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500
        hover:from-purple-600 hover:via-pink-600 hover:to-orange-600
        text-white font-medium shadow-lg hover:shadow-xl
        ${rank && rank <= 3 ? 'animate-pulse' : ''}
      `,
      secondary: `
        bg-gray-700 hover:bg-gray-600 text-white font-medium
        border border-gray-600 hover:border-gray-500
      `,
      minimal: `
        text-gray-400 hover:text-purple-400 bg-transparent hover:bg-purple-500/10
        transition-colors duration-200
      `,
      trending: `
        bg-gradient-to-r from-orange-500 via-red-500 to-pink-500
        hover:from-orange-600 hover:via-red-600 hover:to-pink-600
        text-white font-bold shadow-lg hover:shadow-xl
        animate-pulse
      `
    }
    return variants[variant]
  }

  // Minimal variant for space-constrained areas
  if (variant === 'minimal') {
    return (
      <button
        onClick={() => handleShare()}
        disabled={isSharing}
        className={`
          flex items-center space-x-1.5 ${getButtonSizes()} rounded-lg
          ${getButtonVariant()}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isSharing ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : shareSuccess ? (
          <CheckCircle className="w-3 h-3 text-green-400" />
        ) : (
          <Share className="w-3 h-3" />
        )}
        <span>{isSharing ? 'Sharing...' : shareSuccess ? 'Shared!' : 'Share'}</span>
      </button>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => showOptions ? setShowOptions(false) : handleShare()}
        // onMouseEnter={() => variant !== 'minimal' && setShowOptions(true)}
        onMouseLeave={() => setTimeout(() => setShowOptions(false), 2000)}
        disabled={isSharing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative overflow-hidden group rounded-full transition-all duration-300
          ${getButtonSizes()} ${getButtonVariant()}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {/* Animated background gradient for top performers */}
        {rank && rank <= 3 && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Sparkle effects for top 3 */}
        {rank && rank <= 3 && !isSharing && (
          <div className="absolute inset-0 opacity-30">
            <Sparkles className="w-3 h-3 absolute top-0.5 left-1 animate-ping" />
            <Sparkles className="w-2 h-2 absolute bottom-0.5 right-1 animate-ping animation-delay-300" />
          </div>
        )}
        
        {/* Button content */}
        <div className="relative flex items-center space-x-1.5 z-10">
          {isSharing ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : shareSuccess ? (
            <CheckCircle className="w-3 h-3 text-green-300" />
          ) : (
            <>
              <Cast className="w-3 h-3" />
              <Share className="w-3 h-3" />
            </>
          )}
          <span>
            {isSharing 
              ? 'Sharing...' 
              : shareSuccess 
                ? 'Shared!' 
                : variant === 'trending' 
                  ? `Share #${rank || ''} Trending` 
                  : 'Share Frame'
            }
          </span>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-sm group-hover:blur-md transition-all duration-300 -z-10"></div>
      </motion.button>

      {/* Share Options Dropdown */}
      <AnimatePresence>
        {showOptions && !isSharing && !shareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[200px]"
            onMouseEnter={() => setShowOptions(true)}
            onMouseLeave={() => setShowOptions(false)}
          >
            <div className="p-2">
              {/* Farcaster context indicator */}
              <div className="px-3 py-2 border-b border-gray-600 mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isInFarcaster ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-400">
                    {isInFarcaster ? `In ${farcasterContext}` : 'External context'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleShare('auto')}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
              >
                <Cast className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-sm">Smart Share</div>
                  <div className="text-xs text-gray-400">Auto-detect best method</div>
                </div>
              </button>
              
              <button
                onClick={() => handleShare('warpcast')}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-sm">Open Warpcast</div>
                  <div className="text-xs text-gray-400">Share directly</div>
                </div>
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
              >
                <Copy className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-sm">Copy Frame URL</div>
                  <div className="text-xs text-gray-400">Paste anywhere</div>
                </div>
              </button>

              <button
                onClick={() => handleShare('advanced')}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-sm">Enhanced Share</div>
                  <div className="text-xs text-gray-400">With stats & context</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview tooltip if requested */}
      {showPreview && showOptions && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full ml-4 top-0 bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-xl min-w-[300px] z-50"
        >
          <div className="text-sm">
            <div className="font-semibold mb-2">Frame Preview:</div>
            <div className="text-gray-300 mb-2">{getShareMessage(coin, rank, context)}</div>
            <div className="text-xs text-gray-400">
              Frame URL: {frameUtils.generateShareableFrameUrl(coin.address)}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Utility component for bulk sharing multiple coins
export const BulkShareButton: React.FC<{
  coins: any[]
  title?: string
  description?: string
}> = ({ coins, title = "Hot Creator Coins", description = "Trending coins worth watching" }) => {
  const [isSharing, setIsSharing] = useState(false)

  const handleBulkShare = async () => {
    setIsSharing(true)
    try {
      const frameUrls = coins.slice(0, 3).map(coin => 
        frameUtils.generateShareableFrameUrl(coin.address)
      )
      
      const message = `🔥 ${title}:\n\n${description}\n\n${frameUrls.join('\n\n')}`
      
      if (navigator.share) {
        await navigator.share({
          title,
          text: message
        })
      } else {
        await navigator.clipboard.writeText(message)
        toast.success('Multiple frame URLs copied!')
      }
    } catch (error) {
      toast.error('Failed to share multiple frames')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <button
      onClick={handleBulkShare}
      disabled={isSharing}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50"
    >
      <Share className="w-4 h-4" />
      <span>{isSharing ? 'Sharing...' : `Share ${coins.length} Frames`}</span>
    </button>
  )
}