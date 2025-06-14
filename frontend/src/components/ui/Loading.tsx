import React from 'react'
import { motion } from 'framer-motion'

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-vibe-purple border-t-transparent rounded-full"
      />
    </div>
  )
}
