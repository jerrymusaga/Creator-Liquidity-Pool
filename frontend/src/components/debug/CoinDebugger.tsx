'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useWallet } from '@/hooks/useWallet'
import { useUserProfile } from '@/hooks/useZoraProfile'

export const CoinDebugger: React.FC = () => {
  const { address } = useWallet()
  const { createdCoins, refreshProfile } = useUserProfile(address)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)

  const debugCoinSearch = async () => {
    if (!address) return
    
    setIsDebugging(true)
    setDebugInfo(null)
    
    try {
      console.log('🔍 Starting debug search for address:', address)
      
      // Import the Zora SDK functions
      const { 
        getCoinsNew, 
        getCoinsTopVolume24h, 
        getCoinsTopGainers, 
        getCoinsLastTraded, 
        getCoinsLastTradedUnique, 
        getCoinsMostValuable 
      } = await import('@zoralabs/coins-sdk')
      
      // Fetch from all endpoints
      const [
        recentCoinsResponse, 
        popularCoinsResponse, 
        gainersResponse, 
        tradedResponse, 
        uniqueTradedResponse, 
        valuableResponse
      ] = await Promise.all([
        getCoinsNew({ count: 50 }),
        getCoinsTopVolume24h({ count: 50 }),
        getCoinsTopGainers({ count: 50 }),
        getCoinsLastTraded({ count: 50 }),
        getCoinsLastTradedUnique({ count: 50 }),
        getCoinsMostValuable({ count: 50 })
      ])
      
      // Combine all results
      const allResponses = {
        recent: recentCoinsResponse,
        popular: popularCoinsResponse,
        gainers: gainersResponse,
        traded: tradedResponse,
        uniqueTraded: uniqueTradedResponse,
        valuable: valuableResponse
      }
      
      // Extract all coins
      const allCoins = [
        ...(recentCoinsResponse.data?.exploreList?.edges || []),
        ...(popularCoinsResponse.data?.exploreList?.edges || []),
        ...(gainersResponse.data?.exploreList?.edges || []),
        ...(tradedResponse.data?.exploreList?.edges || []),
        ...(uniqueTradedResponse.data?.exploreList?.edges || []),
        ...(valuableResponse.data?.exploreList?.edges || [])
      ]
      
      console.log('📊 Total coins found across all endpoints:', allCoins.length)
      
      // Check for coins by this user
      const userCoins = allCoins
        .map((edge: any) => edge.node)
        .filter((coin: any) => {
          const creatorAddress = coin.creatorAddress || coin.creator?.address
          return creatorAddress?.toLowerCase() === address.toLowerCase()
        })
      
      // Also check for any coins that might match partial address
      const partialMatches = allCoins
        .map((edge: any) => edge.node)
        .filter((coin: any) => {
          const creatorAddress = coin.creatorAddress || coin.creator?.address
          return creatorAddress?.toLowerCase().includes(address.toLowerCase().slice(0, 10))
        })
      
      // Sample of all coins for analysis
      const sampleCoins = allCoins.slice(0, 10).map((edge: any) => ({
        name: edge.node.name,
        symbol: edge.node.symbol,
        address: edge.node.address,
        creatorAddress: edge.node.creatorAddress,
        chainId: edge.node.chainId,
        createdAt: edge.node.createdAt
      }))
      
      // Check what networks the coins are on
      const networkDistribution: Record<string, number> = {}
      allCoins.forEach((edge: any) => {
        const chainId = edge.node.chainId
        networkDistribution[chainId] = (networkDistribution[chainId] || 0) + 1
      })
      
      // Check recent coins specifically (most likely to contain your new coins)
      const recentCoinsDetailed = (recentCoinsResponse.data?.exploreList?.edges || [])
        .slice(0, 5)
        .map((edge: any) => ({
          name: edge.node.name,
          symbol: edge.node.symbol,
          creatorAddress: edge.node.creatorAddress,
          chainId: edge.node.chainId,
          createdAt: edge.node.createdAt,
          isYours: edge.node.creatorAddress?.toLowerCase() === address.toLowerCase()
        }))
      
      setDebugInfo({
        userAddress: address,
        totalCoinsFound: allCoins.length,
        userCoins: userCoins,
        partialMatches: partialMatches,
        sampleCoins: sampleCoins,
        networkDistribution: networkDistribution,
        recentCoinsDetailed: recentCoinsDetailed,
        responses: {
          recent: recentCoinsResponse.data?.exploreList?.edges?.length || 0,
          popular: popularCoinsResponse.data?.exploreList?.edges?.length || 0,
          gainers: gainersResponse.data?.exploreList?.edges?.length || 0,
          traded: tradedResponse.data?.exploreList?.edges?.length || 0,
          uniqueTraded: uniqueTradedResponse.data?.exploreList?.edges?.length || 0,
          valuable: valuableResponse.data?.exploreList?.edges?.length || 0
        }
      })
      
      console.log('🎯 Debug results:', {
        userCoins: userCoins.length,
        partialMatches: partialMatches.length,
        totalFound: allCoins.length
      })
      
    } catch (error) {
      console.error('❌ Debug search failed:', error)
      setDebugInfo({ error: String(error) })
    }
    
    setIsDebugging(false)
  }

  return (
    <Card className="p-6 bg-gray-800 border-yellow-500">
      <h3 className="text-lg font-bold text-yellow-400 mb-4">🔍 Coin Debug Tool</h3>
      
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>Your Address:</strong> {address}</p>
          <p><strong>Network:</strong> Base Sepolia (84532)</p>
          <p><strong>Created Coins (from hook):</strong> {createdCoins.data?.length || 0}</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            onClick={debugCoinSearch}
            disabled={isDebugging || !address}
            variant="outline"
          >
            {isDebugging ? 'Debugging...' : 'Debug Coin Search'}
          </Button>
          
          <Button 
            onClick={refreshProfile}
            disabled={!address}
            variant="outline"
          >
            Refresh Profile
          </Button>
        </div>
        
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-900 rounded text-xs">
            <h4 className="font-bold text-green-400 mb-2">Debug Results:</h4>
            
            {debugInfo.error ? (
              <p className="text-red-400">Error: {debugInfo.error}</p>
            ) : (
              <div className="space-y-2">
                <p><strong>Total coins found:</strong> {debugInfo.totalCoinsFound}</p>
                <p><strong>Your coins found:</strong> {debugInfo.userCoins?.length || 0}</p>
                <p><strong>Partial matches:</strong> {debugInfo.partialMatches?.length || 0}</p>
                
                <div>
                  <strong>Network distribution:</strong>
                  <ul className="ml-4">
                    {Object.entries(debugInfo.networkDistribution || {}).map(([chainId, count]) => (
                      <li key={chainId}>
                        Chain {chainId}: {count as number} coins 
                        {chainId === '8453' && ' (Base Mainnet)'}
                        {chainId === '84532' && ' (Base Sepolia)'}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <strong>Coins per endpoint:</strong>
                  <ul className="ml-4">
                    <li>Recent: {debugInfo.responses?.recent}</li>
                    <li>Popular: {debugInfo.responses?.popular}</li>
                    <li>Gainers: {debugInfo.responses?.gainers}</li>
                    <li>Traded: {debugInfo.responses?.traded}</li>
                    <li>Unique Traded: {debugInfo.responses?.uniqueTraded}</li>
                    <li>Valuable: {debugInfo.responses?.valuable}</li>
                  </ul>
                </div>
                
                {debugInfo.userCoins?.length > 0 && (
                  <div>
                    <strong>Your coins:</strong>
                    <pre className="text-xs bg-gray-800 p-2 rounded mt-1">
                      {JSON.stringify(debugInfo.userCoins, null, 2)}
                    </pre>
                  </div>
                )}
                
                {debugInfo.recentCoinsDetailed?.length > 0 && (
                  <div>
                    <strong>Recent coins (last 5 created):</strong>
                    <pre className="text-xs bg-gray-800 p-2 rounded mt-1">
                      {JSON.stringify(debugInfo.recentCoinsDetailed, null, 2)}
                    </pre>
                  </div>
                )}
                
                {debugInfo.sampleCoins?.length > 0 && (
                  <div>
                    <strong>Sample coins (first 10):</strong>
                    <pre className="text-xs bg-gray-800 p-2 rounded mt-1">
                      {JSON.stringify(debugInfo.sampleCoins, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}