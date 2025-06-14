import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  neonBorder?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  neonBorder = false
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5 } : {}}
      className={`
        bg-gray-800 border border-gray-700 rounded-xl p-6 
        ${hover ? 'hover:border-vibe-purple transition-colors duration-200' : ''}
        ${neonBorder ? 'neon-border neon-glow' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
