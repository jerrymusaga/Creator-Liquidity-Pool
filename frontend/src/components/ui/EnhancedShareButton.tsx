import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cast, Share, Sparkles, Copy, ExternalLink, CheckCircle, ChevronDown } from 'lucide-react'
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
  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isDesktop = !isMobile

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
        
        // Better desktop handling
        if (isDesktop) {
          const newWindow = window.open(warpcastUrl, '_blank', 'noopener,noreferrer,width=600,height=800')
          if (newWindow) {
            toast.success('Opening Warpcast compose window...', { duration: 3000 })
          } else {
            // Fallback if popup blocked
            await navigator.clipboard.writeText(`${shareMessage}\n\n${frameUrl}`)
            toast.success('Popup blocked. Frame URL copied - open Warpcast to paste!', { duration: 5000 })
          }
        } else {
          window.open(warpcastUrl, '_blank', 'noopener,noreferrer')
          toast.success('Opening Warpcast...', { duration: 3000 })
        }
      } else if (shareMethod === 'copy') {
        const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
        const shareMessage = message || getShareMessage(coin, rank, context)
        await navigator.clipboard.writeText(`${shareMessage}\n\n${frameUrl}`)
        toast.success('Frame URL copied to clipboard!', { duration: 3000 })
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
      sm: isDesktop ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs',
      md: isDesktop ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm',
      lg: isDesktop ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
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
        ${isDesktop ? 'hover:scale-105 transition-all duration-200' : ''}
      `,
      secondary: `
        bg-gray-700 hover:bg-gray-600 text-white font-medium
        border border-gray-600 hover:border-gray-500
        ${isDesktop ? 'hover:scale-105 transition-all duration-200' : ''}
      `,
      minimal: `
        text-gray-400 hover:text-purple-400 bg-transparent hover:bg-purple-500/10
        transition-colors duration-200
        ${isDesktop ? 'hover:scale-105' : ''}
      `,
      trending: `
        bg-gradient-to-r from-orange-500 via-red-500 to-pink-500
        hover:from-orange-600 hover:via-red-600 hover:to-pink-600
        text-white font-bold shadow-lg hover:shadow-xl
        animate-pulse
        ${isDesktop ? 'hover:scale-105 transition-all duration-200' : ''}
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
          flex items-center justify-center space-x-2 ${getButtonSizes()} rounded-lg
          ${getButtonVariant()}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isSharing ? (
          <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
        ) : shareSuccess ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Share className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isSharing ? 'Sharing...' : shareSuccess ? 'Shared!' : 'Share'}
        </span>
      </button>
    )
  }

  // Desktop gets a more sophisticated button with dropdown
  if (isDesktop) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-1">
          {/* Main share button */}
          <motion.button
            onClick={() => handleShare()}
            disabled={isSharing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative overflow-hidden group rounded-lg transition-all duration-300
              ${getButtonSizes()} ${getButtonVariant()}
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center space-x-2
            `}
          >
            {/* Sparkle effects for top 3 */}
            {rank && rank <= 3 && !isSharing && (
              <div className="absolute inset-0 opacity-30">
                <Sparkles className="w-3 h-3 absolute top-1 left-1 animate-ping" />
                <Sparkles className="w-2 h-2 absolute bottom-1 right-1 animate-ping animation-delay-300" />
              </div>
            )}
            
            {/* Button content */}
            <div className="relative flex items-center space-x-2 z-10">
              {isSharing ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              ) : shareSuccess ? (
                <CheckCircle className="w-4 h-4 text-green-300" />
              ) : (
                <Cast className="w-4 h-4" />
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
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-sm group-hover:blur-md transition-all duration-300 -z-10"></div>
          </motion.button>

          {/* Dropdown arrow button */}
          <motion.button
            onClick={() => setShowOptions(!showOptions)}
            disabled={isSharing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-2 py-3 rounded-lg transition-all duration-300
              ${getButtonVariant()}
              disabled:opacity-50 disabled:cursor-not-allowed
              border-l border-white/20
            `}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        {/* Desktop Dropdown Menu */}
        <AnimatePresence>
          {showOptions && !isSharing && !shareSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-[220px] overflow-hidden"
            >
              <div className="p-1">
                {/* Context indicator */}
                <div className="px-3 py-2 border-b border-gray-600 mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-xs text-gray-400">Desktop • {farcasterContext}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleShare('warpcast')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
                >
                  <Cast className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-sm font-medium">Open Warpcast</div>
                    <div className="text-xs text-gray-400">Share in new tab</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
                >
                  <Copy className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-sm font-medium">Copy Frame URL</div>
                    <div className="text-xs text-gray-400">Paste anywhere</div>
                  </div>
                </button>

                <button
                  onClick={() => handleShare('advanced')}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-colors text-left"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <div>
                    <div className="text-sm font-medium">Enhanced Share</div>
                    <div className="text-xs text-gray-400">With stats & context</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Mobile gets a simpler, touch-friendly button
  return (
    <motion.button
      onClick={() => handleShare()}
      disabled={isSharing}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative overflow-hidden group rounded-full transition-all duration-300
        ${getButtonSizes()} ${getButtonVariant()}
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      {/* Sparkle effects for top 3 */}
      {rank && rank <= 3 && !isSharing && (
        <div className="absolute inset-0 opacity-30">
          <Sparkles className="w-3 h-3 absolute top-0.5 left-1 animate-ping" />
          <Sparkles className="w-2 h-2 absolute bottom-0.5 right-1 animate-ping animation-delay-300" />
        </div>
      )}
      
      {/* Button content */}
      <div className="relative flex items-center space-x-2 z-10">
        {isSharing ? (
          <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
        ) : shareSuccess ? (
          <CheckCircle className="w-4 h-4 text-green-300" />
        ) : (
          <>
            <Cast className="w-4 h-4" />
            <Share className="w-4 h-4" />
          </>
        )}
        <span className="text-sm">
          {isSharing 
            ? 'Sharing...' 
            : shareSuccess 
              ? 'Shared!' 
              : variant === 'trending' 
                ? `#${rank || ''} Trending` 
                : 'Share'
          }
        </span>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-sm group-hover:blur-md transition-all duration-300 -z-10"></div>
    </motion.button>
  )
}

// Utility component for bulk sharing multiple coins
export const BulkShareButton: React.FC<{
  coins: any[]
  title?: string
  description?: string
}> = ({ coins, title = "Hot Creator Coins", description = "Trending coins worth watching" }) => {
  const [isSharing, setIsSharing] = useState(false)
  const isDesktop = typeof window !== 'undefined' && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  const handleBulkShare = async () => {
    setIsSharing(true)
    try {
      const frameUrls = coins.slice(0, 3).map(coin => 
        frameUtils.generateShareableFrameUrl(coin.address)
      )
      
      const message = `🔥 ${title}:\n\n${description}\n\n${frameUrls.join('\n\n')}`
      
      if (isDesktop) {
        // Desktop: open Warpcast
        const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrls[0], message)
        window.open(warpcastUrl, '_blank', 'noopener,noreferrer,width=600,height=800')
        toast.success('Opening Warpcast with multiple frames...')
      } else {
        // Mobile: try native share
        if (navigator.share) {
          await navigator.share({
            title,
            text: message
          })
        } else {
          await navigator.clipboard.writeText(message)
          toast.success('Multiple frame URLs copied!')
        }
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
      className={`
        flex items-center space-x-2 rounded-lg transition-all disabled:opacity-50
        ${isDesktop 
          ? 'px-6 py-3 text-base hover:scale-105' 
          : 'px-4 py-2 text-sm'
        }
        bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white
      `}
    >
      <Share className="w-4 h-4" />
      <span>{isSharing ? 'Sharing...' : `Share ${coins.length} Frames`}</span>
    </button>
  )
}