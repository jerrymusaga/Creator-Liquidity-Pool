'use client'

import { useState } from 'react'
import { parseEther } from 'viem'
import { useZoraSDK } from '@/hooks/useZoraSDK'
import { useWallet } from '@/hooks/useWallet'
import { CustomConnectButton } from '@/components/wallet/ConnectButton'

export default function TestCoinPage() {
  const { createCoin, isCreating } = useZoraSDK()
  const { isConnected, address } = useWallet()
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTestCoin = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first')
      return
    }

    setError(null)
    setResult(null)

    try {
      console.log('🚀 Starting test coin creation...')
      
      const testCoinParams = {
        name: 'Test Creator Coin',
        symbol: 'TEST',
        description: 'A test coin created using Zora SDK for debugging purposes',
        image: 'https://api.dicebear.com/7.x/identicon/svg?seed=test-coin',
        initialPurchaseWei: parseEther('0.001') // 0.001 ETH
      }

      console.log('📋 Test coin parameters:', testCoinParams)

      const coinAddress = await createCoin(testCoinParams)
      
      if (coinAddress) {
        setResult(coinAddress)
        console.log('✅ Coin created successfully:', coinAddress)
      } else {
        setError('Coin creation returned null')
        console.error('❌ Coin creation returned null')
      }
    } catch (err: any) {
      console.error('❌ Error creating test coin:', err)
      setError(err.message || 'Unknown error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Test Coin Creation</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
          {isConnected ? (
            <div className="space-y-2">
              <p className="text-green-400">✅ Wallet Connected</p>
              <p className="text-sm text-gray-400">Address: {address}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-yellow-400">⚠️ Wallet Not Connected</p>
              <CustomConnectButton />
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Coin Parameters</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Name:</strong> Test Creator Coin</p>
            <p><strong>Symbol:</strong> TEST</p>
            <p><strong>Description:</strong> A test coin created using Zora SDK for debugging purposes</p>
            <p><strong>Initial Purchase:</strong> 0.001 ETH</p>
            <p><strong>Network:</strong> Base Sepolia (84532)</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Test Coin</h2>
          <button
            onClick={handleCreateTestCoin}
            disabled={!isConnected || isCreating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isCreating ? 'Creating Coin...' : 'Create Test Coin'}
          </button>
        </div>

        {result && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">✅ Success!</h2>
            <p className="text-sm break-all">
              <strong>Coin Address:</strong> {result}
            </p>
            <a 
              href={`https://sepolia.basescan.org/address/${result}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors"
            >
              View on BaseScan →
            </a>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-400">❌ Error</h2>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you're connected to Base Sepolia testnet</li>
            <li>Ensure you have some ETH for gas fees (you can get testnet ETH from faucets)</li>
            <li>Click "Create Test Coin" to attempt coin creation</li>
            <li>Check the browser console for detailed logs</li>
            <li>If successful, the coin address will be displayed above</li>
          </ol>
        </div>
      </div>
    </div>
  )
}