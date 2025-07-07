import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
// Mock users data - TODO: Replace with real authentication
const mockUsers = [
  {
    id: '1',
    username: 'TestCreator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
    isCreator: true,
    walletAddress: '0x1234...5678'
  },
  {
    id: '2',
    username: 'TestUser',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
    isCreator: false
  }
]

interface WelcomeProps {
  onComplete: () => void
}

export const Welcome: React.FC<WelcomeProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const [userType, setUserType] = useState<'creator' | 'fan' | null>(null)
  const { setUser } = useStore()

  const handleUserTypeSelect = (type: 'creator' | 'fan') => {
    setUserType(type)
    setStep(1)
  }

  const handleLogin = () => {
    // Mock login - in real app, this would handle Farcaster/Web3Auth
    const mockUser = userType === 'creator' ? mockUsers[0] : mockUsers[1]
    setUser(mockUser)
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Logo Animation */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-vibe rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <span className="text-white font-bold text-4xl">V</span>
            </motion.div>

            <h1 className="text-4xl font-bold mb-4 bg-gradient-vibe bg-clip-text text-transparent">
              Vibe
            </h1>
            <p className="text-xl text-gray-300 mb-12">
              Creators and fans earn together!
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => handleUserTypeSelect('creator')}
                className="w-full"
                size="lg"
              >
                I&apos;m a Creator 🎨
              </Button>
              <Button
                onClick={() => handleUserTypeSelect('fan')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                I&apos;m a Fan 💫
              </Button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              {userType === 'creator' ? 'Welcome, Creator!' : 'Welcome, Fan!'}
            </h2>
            <p className="text-gray-300 mb-8">
              {userType === 'creator' 
                ? 'Launch your economy and earn from your content'
                : 'Support creators and earn rewards together'
              }
            </p>

            <div className="bg-gray-800 p-6 rounded-xl mb-8">
              <h3 className="font-semibold mb-4">Quick Setup</h3>
              <p className="text-sm text-gray-400">
                Sign in with your Farcaster account for instant access
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full mb-4"
              size="lg"
            >
              Continue with Farcaster
            </Button>
            
            <button
              onClick={() => setStep(0)}
              className="text-vibe-purple hover:underline"
            >
              Back
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}