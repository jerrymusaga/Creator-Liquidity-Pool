import React from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Menu } from 'lucide-react'
import { useStore } from '@/stores/useStore'

export const Header: React.FC = () => {
  const { user } = useStore()

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-gradient-vibe rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl animate-pulse-slow">V</span>
            </div>
            <span className="text-xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
              Vibe
            </span>
          </motion.div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user.username}</span>
              </div>
            ) : (
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </button>
            )}
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}