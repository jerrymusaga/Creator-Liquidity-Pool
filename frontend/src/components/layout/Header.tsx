import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {  Bell, Menu, Zap, Activity, Crown, FireExtinguisher } from 'lucide-react'
import { CustomConnectButton } from '@/components/wallet/ConnectButton'

export const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  
  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
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
                className="w-10 h-10 bg-gradient-vibe rounded-full flex items-center justify-center"
              >
                <span className="text-white font-bold text-xl">V</span>
              </motion.div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-vibe rounded-full blur-md opacity-20 -z-10" />
            </div>
            
            <div>
              <span className="text-xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
                Vibe
              </span>
              <div className="text-xs text-gray-500 -mt-1">
                Creator Coins
              </div>
              <CustomConnectButton showBalance={true} size="sm" />
            </div>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* V4 Status Indicator */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden sm:flex items-center space-x-1 bg-vibe-green/20 text-vibe-green px-2 py-1 rounded-full"
            >
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">V4 Live</span>
            </motion.div>
            
            {/* Activity Indicator */}
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-vibe-green rounded-full"
              />
              <div className="absolute inset-0 bg-vibe-green rounded-full animate-ping opacity-30" />
            </div>
            
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <Bell className="w-5 h-5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-vibe-purple rounded-full flex items-center justify-center"
              >
                <span className="text-xs text-white font-bold">3</span>
              </motion.div>
            </button>
          </div>
        </div>
        
        {/* Live Stats Bar (optional, can be toggled) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden sm:flex justify-center space-x-6 mt-3 text-xs text-gray-400"
        >
          <div className="flex items-center space-x-1">
            <Activity className="w-3 h-3 text-vibe-purple" />
            <span>$2.4K Volume 24h</span>
          </div>
          <div className="flex items-center space-x-1">
            <Crown className="w-3 h-3 text-vibe-gold" />
            <span>47 Creator Coins</span>
          </div>
          <div className="flex items-center space-x-1">
            <FireExtinguisher className="w-3 h-3 text-orange-400" />
            <span>12 Content Coins</span>
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