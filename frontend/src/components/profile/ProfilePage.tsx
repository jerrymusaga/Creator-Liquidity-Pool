import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
export const ProfilePage: React.FC = () => {
  const { user, economies } = useStore()
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-gray-400">Sign in to view your profile</p>
      </div>
    )
  }
  const userEconomies = economies.filter((economy) => economy.creator.id === user.id)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-6"
    >
      <Card className="mb-6" neonBorder>
        <div className="flex items-center space-x-4 p-6">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-400">{user.isCreator ? 'Creator' : 'Fan'}</p>
            {user.walletAddress && (
              <p className="text-sm text-gray-500 truncate">{user.walletAddress}</p>
            )}
          </div>
        </div>
      </Card>

  {user.isCreator && (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Your Economies</h3>
      {userEconomies.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No economies yet! Create one.</p>
      ) : (
        <div className="space-y-4">
          {userEconomies.map((economy) => (
            <Card key={economy.id} className="flex items-center space-x-4 p-4">
              <img
                src={economy.image}
                alt={economy.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold">{economy.name}</h4>
                <p className="text-sm text-gray-400">{economy.nftsMinted} NFTs • ${economy.liquidityPool} Pool</p>
              </div>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )}

  <Button className="w-full" onClick={() => console.log('Edit profile')}>
    Edit Profile
  </Button>
</motion.div>

  )
}

