import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, TrendingUp, Plus, Wallet, User
} from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'


interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { isConnected, isOnCorrectNetwork } = useWallet()
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Discover', 
      activeColor: 'text-vibe-purple',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'trending', 
      icon: TrendingUp, 
      label: 'Culture', 
      activeColor: 'text-vibe-pink',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'create', 
      icon: Plus, 
      label: 'Create', 
      activeColor: 'text-vibe-green',
      inactiveColor: 'text-gray-400',
      special: true // Special styling for create button
    },
    { 
      id: 'wallet', 
      icon: Wallet, 
      label: 'Wallet', 
      activeColor: 'text-vibe-blue',
      inactiveColor: 'text-gray-400'
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Profile', 
      activeColor: 'text-vibe-orange',
      inactiveColor: 'text-gray-400'
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {isConnected && !isOnCorrectNetwork && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        )}
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? `${tab.activeColor} bg-gray-800/50` 
                  : `${tab.inactiveColor} hover:text-white`
              } ${tab.special && isActive ? 'bg-vibe-green/20' : ''}`}
            >
              {/* Special glow effect for active create button */}
              {tab.special && isActive && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 bg-vibe-green/10 rounded-xl blur-sm"
                />
              )}
              
              {/* Icon with enhanced visual feedback */}
              <div className={`relative ${tab.special && isActive ? 'animate-pulse' : ''}`}>
                <Icon className={`w-6 h-6 mb-1 ${
                  tab.special && isActive ? 'drop-shadow-lg' : ''
                }`} />
                
                {/* Activity indicator dots */}
                {tab.id === 'wallet' && isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-vibe-green rounded-full"
                  />
                )}
                
                {tab.id === 'trending' && isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-vibe-pink rounded-full animate-pulse"
                  />
                )}
              </div>
              
              <span className={`text-xs font-medium ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {tab.label}
              </span>
              
              {/* Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className={`absolute -top-px left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full ${
                    tab.activeColor.replace('text-', 'bg-')
                  }`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      
      {/* Safe area padding for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-gray-900/95" />
    </nav>
  )
}