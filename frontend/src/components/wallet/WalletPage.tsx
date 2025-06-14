import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/stores/useStore'
import { Coins, Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
export const WalletPage: React.FC = () => {
  const { user, userNFTs, transactions } = useStore()
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-gray-400">Sign in to view your wallet</p>
      </div>
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-6"
    >
      <h2 className="text-2xl font-bold mb-6">Your Vibe Wallet</h2>

  {/* Balance */}
  <Card className="mb-6" neonBorder>
    <div className="text-center py-6">
      <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
      <p className="text-3xl font-bold bg-gradient-vibe bg-clip-text text-transparent">
        $12.50
      </p>
      <p className="text-sm text-gray-400 mt-2">Across all economies</p>
      <Button className="mt-4" size="sm">
        Withdraw
      </Button>
    </div>
  </Card>

  {/* NFTs */}
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-4">Your NFTs</h3>
    {userNFTs.length === 0 ? (
      <p className="text-gray-400 text-center py-6">No NFTs yet! Mint some from the Home feed.</p>
    ) : (
      <div className="grid grid-cols-2 gap-4">
        {userNFTs.map((nft) => (
          <Card key={nft.id} className="p-4">
            <img
              src={nft.image}
              alt={nft.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <h4 className="font-semibold text-sm">{nft.title}</h4>
            <p className="text-xs text-gray-400">Minted: {nft.mintedAt.toLocaleDateString()}</p>
          </Card>
        ))}
      </div>
    )}
  </div>

  {/* Transactions */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
    {transactions.length === 0 ? (
      <p className="text-gray-400 text-center py-6">No transactions yet! Start vibing.</p>
    ) : (
      <div className="space-y-4">
        {transactions.map((tx) => (
          <Card key={tx.id} className="flex items-center space-x-4 p-4">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              {tx.type === 'mint' && <Coins className="w-5 h-5 text-vibe-purple" />}
              {tx.type === 'trade' && <ArrowUpRight className="w-5 h-5 text-vibe-blue" />}
              {tx.type === 'invest' && <ArrowDownLeft className="w-5 h-5 text-vibe-green" />}
              {tx.type === 'reward' && <Gift className="w-5 h-5 text-vibe-pink" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold capitalize">{tx.type}</p>
              <p className="text-sm text-gray-400">
                {tx.amount} {tx.tokenSymbol} • {tx.timestamp.toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm font-semibold">
              {tx.type === 'trade' || tx.type === 'invest' ? '+' : ''}{tx.amount} {tx.tokenSymbol}
            </p>
          </Card>
        ))}
      </div>
    )}
  </div>
</motion.div>

  )
}

