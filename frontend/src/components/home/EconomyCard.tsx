import React from 'react'
import { motion } from 'framer-motion'
import { Play, Coins, Users, TrendingUp } from 'lucide-react'
import { Economy } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface EconomyCardProps {
  economy: Economy
  onMint: (economy: Economy) => void
  onJoin: (economy: Economy) => void
}

export const EconomyCard: React.FC<EconomyCardProps> = ({
  economy,
  onMint,
  onJoin
}) => {
  return (
    <Card className="relative overflow-hidden mb-6" neonBorder>
      {/* Video/Image */}
      <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
        <img
          src={economy.image}
          alt={economy.name}
          className="w-full h-full object-cover"
        />
        {economy.video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Creator Info */}
        <div className="flex items-center space-x-3">
          <img
            src={economy.creator.avatar}
            alt={economy.creator.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{economy.creator.username}</h3>
            <p className="text-sm text-gray-400">Creator</p>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h2 className="text-xl font-bold mb-2">{economy.name}</h2>
          <p className="text-gray-300 text-sm">{economy.description}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Coins className="w-4 h-4 text-vibe-purple mr-1" />
              <span className="text-xs text-gray-400">Price</span>
            </div>
            <p className="font-semibold">${economy.currentPrice}</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-vibe-blue mr-1" />
              <span className="text-xs text-gray-400">NFTs</span>
            </div>
            <p className="font-semibold">{economy.nftsMinted}</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-vibe-green mr-1" />
              <span className="text-xs text-gray-400">Pool</span>
            </div>
            <p className="font-semibold">${economy.liquidityPool}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={() => onMint(economy)}
            size="sm"
            className="flex-1"
          >
            Mint Free
          </Button>
          <Button
            onClick={() => onJoin(economy)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Join Vibe
          </Button>
        </div>
      </div>
    </Card>
  )
}