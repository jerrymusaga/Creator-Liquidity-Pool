import React from 'react'
import { motion } from 'framer-motion'
import { Home, TrendingUp, Wallet, User, Plus } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'trending', icon: TrendingUp, label: 'Trending' },
    { id: 'create', icon: Plus, label: 'Create' },
    { id: 'wallet', icon: Wallet, label: 'Wallet' },
    { id: 'profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-vibe-purple bg-vibe-purple/20' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
