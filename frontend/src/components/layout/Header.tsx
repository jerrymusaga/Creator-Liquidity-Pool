import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Menu, Zap, Activity, Crown, FireExtinguisher, Share2, Cast } from 'lucide-react'
import { CustomConnectButton } from '@/components/wallet/ConnectButton'
import { useDashboardCoins } from '@/hooks/useZoraCoins'

export const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { topVolume, newCoins, topGainers, isLoading } = useDashboardCoins()
  
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section - Responsive */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 flex-1 min-w-0"
          >
            <div className="relative flex-shrink-0">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  repeatDelay: 5
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-vibe rounded-full flex items-center justify-center"
              >
                <span className="text-white font-bold text-xs sm:text-sm">VS</span>
              </motion.div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-vibe rounded-full blur-md opacity-20 -z-10" />
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-xl font-bold bg-gradient-vibe bg-clip-text text-transparent truncate">
                  VibeStream
                </span>
                {/* Farcaster Integration Badge */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="hidden sm:flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full text-xs"
                >
                  <Cast className="w-3 h-3" />
                  <span>Farcaster</span>
                </motion.div>
              </div>
              <div className="text-xs text-gray-500 -mt-1 hidden sm:block">
                Creator Coins
              </div>
            </div>
          </motion.div>

          {/* Center Actions - Mobile Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* V4 Status Indicator */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden md:flex items-center space-x-1 bg-vibe-green/20 text-vibe-green px-2 py-1 rounded-full"
            >
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">V4 Live</span>
            </motion.div>
            
            {/* Mobile V4 Indicator */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="md:hidden w-2 h-2 bg-vibe-green rounded-full relative"
            >
              <div className="absolute inset-0 bg-vibe-green rounded-full animate-ping opacity-30" />
            </motion.div>
            
            {/* Farcaster Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Farcaster frame sharing logic
                if (navigator.share) {
                  navigator.share({
                    title: 'VibeStream - Creator Coins',
                    text: 'Check out VibeStream on Farcaster!',
                    url: window.location.href
                  })
                }
              }}
              className="hidden sm:flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
            >
              <Share2 className="w-3 h-3" />
              <span>Cast</span>
            </motion.button>
            
            {/* Connect Button - Responsive */}
            <div className="hidden sm:block">
              <CustomConnectButton showBalance={true} size="sm" />
            </div>
            
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {(topGainers.data?.length || 0) > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-vibe-purple rounded-full flex items-center justify-center"
                >
                  <span className="text-xs text-white font-bold">
                    {Math.min(topGainers.data?.length || 0, 9)}
                  </span>
                </motion.div>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="space-y-3">
              <CustomConnectButton showBalance={true} size="sm" />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'VibeStream - Creator Coins',
                        text: 'Check out VibeStream on Farcaster!',
                        url: window.location.href
                      })
                    }
                  }}
                  className="flex items-center space-x-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                >
                  <Cast className="w-3 h-3" />
                  
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Live Stats Bar - Responsive with Real Data */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center space-x-3 sm:space-x-6 mt-3 text-xs text-gray-400 overflow-x-auto"
        >
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <Activity className="w-3 h-3 text-vibe-purple" />
            {isLoading ? (
              <div className="w-12 h-3 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  ${topVolume.data?.length ? 
                    (topVolume.data[0]?.volume24h || 0).toLocaleString() : 
                    '0'} Volume 24h
                </span>
                <span className="sm:hidden">
                  ${topVolume.data?.length ? 
                    (topVolume.data[0]?.volume24h || 0).toLocaleString() : 
                    '0'}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <Crown className="w-3 h-3 text-vibe-gold" />
            {isLoading ? (
              <div className="w-12 h-3 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  {topVolume.data?.length || 0} Creator Coins
                </span>
                <span className="sm:hidden">
                  {topVolume.data?.length || 0} Coins
                </span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <FireExtinguisher className="w-3 h-3 text-orange-400" />
            {isLoading ? (
              <div className="w-12 h-3 bg-gray-700 rounded animate-pulse" />
            ) : (
              <>
                <span className="hidden sm:inline">
                  {newCoins.data?.length || 0} New Coins
                </span>
                <span className="sm:hidden">
                  {newCoins.data?.length || 0} New
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  )
}

// Notification Toast Component for mobile
export const NotificationToast: React.FC<{
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'reward'
  onClose: () => void
}> = ({ title, message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <Zap className="w-5 h-5 text-vibe-green" />
      case 'error': return <Activity className="w-5 h-5 text-red-400" />
      case 'reward': return <Crown className="w-5 h-5 text-vibe-purple" />
      default: return <Bell className="w-5 h-5 text-vibe-blue" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-vibe-green/20 border-vibe-green/30'
      case 'error': return 'bg-red-500/20 border-red-500/30'
      case 'reward': return 'bg-vibe-purple/20 border-vibe-purple/30'
      default: return 'bg-vibe-blue/20 border-vibe-blue/30'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-20 left-4 right-4 z-50 p-4 rounded-xl border backdrop-blur-sm ${getBgColor()}`}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{title}</h4>
          <p className="text-sm text-gray-300 mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <span className="sr-only">Close</span>
          ×
        </button>
      </div>
    </motion.div>
  )
}