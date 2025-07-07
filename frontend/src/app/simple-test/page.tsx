'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { createCoin as zoraCoinSDKCreateCoin, DeployCurrency, setApiKey } from '@zoralabs/coins-sdk'

export default function SimpleTestPage() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [result, setResult] = useState<any>(null)
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const runSimpleTest = async () => {
    try {
      setStatus('Starting test...')
      
      // Check wallet connection
      if (!isConnected || !address) {
        setStatus('❌ Wallet not connected')
        return
      }
      
      if (!walletClient || !publicClient) {
        setStatus('❌ Wallet clients not available')
        return
      }
      
      setStatus('✅ Wallet connected, setting up...')
      
      // Set API key
      setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY || '')
      
      // Simple test parameters
      const testParams = {
        name: 'Simple Test Coin',
        symbol: 'SIMPLE',
        uri: 'data:application/json;base64,' + btoa(JSON.stringify({
          name: 'Simple Test Coin',
          description: 'A simple test coin for debugging',
          image: 'https://api.dicebear.com/7.x/identicon/svg?seed=simple'
        })),
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
        chainId: walletClient.chain?.id || 84532
      }
      
      setStatus('🚀 Attempting to create coin...')
      console.log('Test parameters:', testParams)
      
      const result = await zoraCoinSDKCreateCoin(
        testParams as any,
        walletClient,
        publicClient
      )
      
      setStatus('✅ Coin creation completed!')
      setResult(result)
      console.log('Coin creation result:', result)
      
    } catch (error: any) {
      setStatus('❌ Error: ' + error.message)
      console.error('Test error:', error)
      setResult({ error: error.message, stack: error.stack })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Coin Creation Test</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p>Connected: {isConnected ? '✅ Yes' : '❌ No'}</p>
            <p>Address: {address || 'Not connected'}</p>
            <p>Chain: {walletClient?.chain?.name || 'Unknown'} ({walletClient?.chain?.id})</p>
            <p>Wallet Client: {walletClient ? '✅ Available' : '❌ Not available'}</p>
            <p>Public Client: {publicClient ? '✅ Available' : '❌ Not available'}</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Status</h2>
          <p className="mb-4">{status}</p>
          <button
            onClick={runSimpleTest}
            disabled={!isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Run Simple Test
          </button>
        </div>

        {result && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}