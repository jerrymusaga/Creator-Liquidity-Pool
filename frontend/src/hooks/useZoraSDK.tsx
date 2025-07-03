
import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther, formatEther, Address } from 'viem'
import { 
  createCoin, 
  validateMetadataURIContent,
  getCoinCreateFromLogs,
  DeployCurrency,
  type CreateCoinArgs,
  type InitialPurchaseCurrency,
  getCoin,
  getCoinsTopVolume24h,
  getCoinsNew,
  getCoinsTopGainers,
  setApiKey
} from '@zoralabs/coins-sdk'
import { getCurrentNetworkConfig } from '@/config/networks'
import toast from 'react-hot-toast'

interface CreateCoinParams {
  name: string
  symbol: string
  description: string
  image: string
  initialPurchaseWei?: bigint
}

interface ZoraCoinData {
  address: string
  name: string
  symbol: string
  description: string
  image: string
  totalSupply: string
  marketCap: string
  volume24h: string
  holderCount: number
  currentPrice: string
  priceChange24h: number
  creator: {
    address: string
    username: string
    avatar: string
  }
  createdAt: string
  isV4: boolean
  autoRewardsEnabled: boolean
}

export function useZoraSDK() {
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { address, isConnected } = useAccount()
  const networkConfig = getCurrentNetworkConfig()
  const publicClient = usePublicClient({ chainId: networkConfig.chain.id })
  const { data: walletClient } = useWalletClient({ chainId: networkConfig.chain.id })

  // Configure API key if available
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ZORA_API_KEY) {
      setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY)
    }
  }, [])

  /**
   * Upload metadata to IPFS using Pinata or similar service
   */
  const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
    try {
      
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      })

      if (!response.ok) {
        throw new Error('Failed to upload metadata')
      }

      const { ipfsHash } = await response.json()
      return `ipfs://${ipfsHash}`
    } catch (error) {
      console.error('IPFS upload failed:', error)
      throw new Error('Failed to upload metadata to IPFS')
    }
  }

  /**
   * Create a new Creator Coin using Zora SDK
   */
  const createCoin = async (params: CreateCoinParams): Promise<string | null> => {
    if (!isConnected || !address || !walletClient || !publicClient) {
      toast.error('Please connect your wallet first')
      return null
    }

    setIsCreating(true)
    
    try {
      // Prepare metadata following EIP-7572 standard
      const metadata = {
        name: params.name,
        description: params.description,
        image: params.image,
        external_url: `https://vibe.app/creator/${address}`,
        properties: {
          creator: address,
          platform: "Vibe",
          version: "v4",
          auto_rewards: true,
          category: "creator_coin"
        },
        attributes: [
          {
            trait_type: "Creator",
            value: address
          },
          {
            trait_type: "Platform", 
            value: "Vibe"
          },
          {
            trait_type: "Version",
            value: "V4"
          },
          {
            trait_type: "Auto Rewards",
            value: "Enabled"
          },
          {
            trait_type: "Created At",
            value: new Date().toISOString()
          }
        ]
      }

      // Upload metadata to IPFS
      const metadataUri = await uploadMetadataToIPFS(metadata)
      
      // Validate metadata URI
      await validateMetadataURIContent(metadataUri)

      // Prepare coin creation parameters
      const coinParams: CreateCoinArgs = {
        name: params.name,
        symbol: params.symbol,
        uri: metadataUri as any, 
        payoutRecipient: address,
        platformReferrer: process.env.NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS as Address,
        currency: DeployCurrency.ETH,
        chainId: networkConfig.chain.id,
        initialPurchase: {
          currency: 'ETH' as InitialPurchaseCurrency,
          amount: params.initialPurchaseWei || parseEther("0.001")
        }
      }

      // Validate network before creating coin
      const chainId = networkConfig.chain.id
      const networkName = chainId === 8453 ? 'base' : 'baseSepolia'
      console.log('Network Config Chain ID:', chainId, 'Expected Base:', 8453, 'Expected Base Sepolia:', 84532)
      console.log('Creating coin on network:', networkName, 'Chain ID:', chainId)
      
      // Check if we're on a supported network
      if (chainId !== 8453 && chainId !== 84532) {
        throw new Error(`Unsupported network. Please switch to Base (8453) or Base Sepolia (84532). Current: ${chainId}`)
      }
      
      // Check client configuration
      console.log('Public Client Chain ID:', publicClient?.chain?.id || 'undefined')
      console.log('Wallet Client Chain ID:', walletClient?.chain?.id || 'undefined')
      
      // Create the coin using Zora SDK
      const result = await createCoin({
        ...coinParams,
        publicClient,
        walletClient
      })

      if (result && typeof result === 'object' && 'success' in result && result.success && result.receipt) {
        // Extract coin address from transaction logs
        const coinDeployment = getCoinCreateFromLogs(result.receipt)
        const coinAddress = coinDeployment?.coin

        if (!coinAddress) {
          throw new Error('Failed to extract coin address from transaction')
        }

        toast.success(
          <div className="flex items-center">
            <span className="mr-2">🚀</span>
            <div>
              <p className="font-semibold">Creator Coin Deployed!</p>
              <p className="text-xs text-gray-400">V4 auto-rewards enabled • {coinAddress.slice(0, 8)}...</p>
            </div>
          </div>,
          { duration: 5000 }
        )
        
        return coinAddress
      } else if (typeof result === 'string') {
        // If result is a string, it's likely the coin address
        toast.success(
          <div className="flex items-center">
            <span className="mr-2">🚀</span>
            <div>
              <p className="font-semibold">Creator Coin Deployed!</p>
              <p className="text-xs text-gray-400">V4 auto-rewards enabled • {result.slice(0, 8)}...</p>
            </div>
          </div>,
          { duration: 5000 }
        )
        
        return result
      } else {
        throw new Error(result && typeof result === 'object' && 'error' in result ? result.error : 'Coin creation failed')
      }

    } catch (error: any) {
      console.error('Coin creation failed:', error)
      
      if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient ETH balance for coin creation')
      } else if (error.message?.includes('user rejected')) {
        toast.error('Transaction rejected by user')
      } else {
        toast.error(`Failed to create coin: ${error.message}`)
      }
      
      return null
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Get top coins by volume using Zora SDK
   */
  const getTopCoins = async (limit: number = 20): Promise<ZoraCoinData[]> => {
    setIsLoading(true)
    
    try {
      const response = await getCoinsTopVolume24h({
        count: limit
      })

      const coins = response.data?.exploreList?.edges?.map((edge: any) => {
        const coin = edge.node
        return {
          address: coin.address,
          name: coin.name || 'Unnamed Coin',
          symbol: coin.symbol || 'UNKNOWN',
          description: coin.description || 'A Creator Coin on Zora V4',
          image: coin.image?.previewImage?.medium || coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
          totalSupply: coin.totalSupply || '0',
          marketCap: coin.marketCap || '0',
          volume24h: coin.volume24h || coin.totalVolume || '0',
          holderCount: coin.uniqueHolders || 0,
          currentPrice: coin.currentPrice || coin.priceUSD || '0',
          priceChange24h: coin.priceChange24h || coin.priceChangePercent24h || 0,
          creator: {
            address: coin.creatorAddress || '',
            username: coin.creatorProfile?.handle || `${coin.creatorAddress?.slice(0,6)}...${coin.creatorAddress?.slice(-4)}` || 'Unknown',
            avatar: coin.creatorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coin.creatorAddress}`
          },
          createdAt: coin.createdAt || new Date().toISOString(),
          isV4: true,
          autoRewardsEnabled: true
        }
      }) || []

      return coins

    } catch (error) {
      console.error('Failed to fetch top coins:', error)
      toast.error('Failed to load Creator Coins from Zora')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get new coins using Zora SDK
   */
  const getNewCoins = async (limit: number = 20): Promise<ZoraCoinData[]> => {
    setIsLoading(true)
    
    try {
      const response = await getCoinsNew({
        count: limit
      })

      const coins = response.data?.exploreList?.edges?.map((edge: any) => {
        const coin = edge.node
        return {
          address: coin.address,
          name: coin.name || 'Unnamed Coin',
          symbol: coin.symbol || 'UNKNOWN',
          description: coin.description || 'A Creator Coin on Zora V4',
          image: coin.image?.previewImage?.medium || coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
          totalSupply: coin.totalSupply || '0',
          marketCap: coin.marketCap || '0',
          volume24h: coin.volume24h || coin.totalVolume || '0',
          holderCount: coin.uniqueHolders || 0,
          currentPrice: coin.currentPrice || coin.priceUSD || '0',
          priceChange24h: coin.priceChange24h || coin.priceChangePercent24h || 0,
          creator: {
            address: coin.creatorAddress || '',
            username: coin.creatorProfile?.handle || `${coin.creatorAddress?.slice(0,6)}...${coin.creatorAddress?.slice(-4)}` || 'Unknown',
            avatar: coin.creatorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coin.creatorAddress}`
          },
          createdAt: coin.createdAt || new Date().toISOString(),
          isV4: true,
          autoRewardsEnabled: true
        }
      }) || []

      return coins

    } catch (error) {
      console.error('Failed to fetch new coins:', error)
      toast.error('Failed to load new Creator Coins')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get top gaining coins using Zora SDK
   */
  const getTopGainers = async (limit: number = 20): Promise<ZoraCoinData[]> => {
    setIsLoading(true)
    
    try {
      const response = await getCoinsTopGainers({
        count: limit
      })

      const coins = response.data?.exploreList?.edges?.map((edge: any) => {
        const coin = edge.node
        return {
          address: coin.address,
          name: coin.name || 'Unnamed Coin',
          symbol: coin.symbol || 'UNKNOWN',
          description: coin.description || 'A Creator Coin on Zora V4',
          image: coin.image?.previewImage?.medium || coin.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
          totalSupply: coin.totalSupply || '0',
          marketCap: coin.marketCap || '0',
          volume24h: coin.volume24h || coin.totalVolume || '0',
          holderCount: coin.uniqueHolders || 0,
          currentPrice: coin.currentPrice || coin.priceUSD || '0',
          priceChange24h: coin.priceChange24h || coin.priceChangePercent24h || 0,
          creator: {
            address: coin.creatorAddress || '',
            username: coin.creatorProfile?.handle || `${coin.creatorAddress?.slice(0,6)}...${coin.creatorAddress?.slice(-4)}` || 'Unknown',
            avatar: coin.creatorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coin.creatorAddress}`
          },
          createdAt: coin.createdAt || new Date().toISOString(),
          isV4: true,
          autoRewardsEnabled: true
        }
      }) || []

      return coins

    } catch (error) {
      console.error('Failed to fetch top gainers:', error)
      toast.error('Failed to load top gaining coins')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get specific coin data using Zora SDK
   */
  const getCoinData = async (coinAddress: string): Promise<ZoraCoinData | null> => {
    try {
      const response = await getCoin({
        address: coinAddress
      })
      
      const coinData = response.data?.zora20Token
      if (!coinData) return null
      
      return {
        address: coinData.address,
        name: coinData.name || 'Unnamed Coin',
        symbol: coinData.symbol || 'UNKNOWN',
        description: coinData.description || 'A Creator Coin on Zora V4',
        image: (coinData as any).image || `https://api.dicebear.com/7.x/identicon/svg?seed=${coinData.symbol}`,
        totalSupply: coinData.totalSupply || '0',
        marketCap: coinData.marketCap || '0',
        volume24h: coinData.volume24h || '0',
        holderCount: coinData.uniqueHolders || 0,
        currentPrice: (coinData as any).priceUSD || '0',
        priceChange24h: (coinData as any).priceChangePercent24h || 0,
        creator: {
          address: coinData.creatorAddress || '',
          username: coinData.creatorProfile?.handle || `${coinData.creatorAddress?.slice(0,6)}...${coinData.creatorAddress?.slice(-4)}` || 'Unknown',
          avatar: coinData.creatorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${coinData.creatorAddress}`
        },
        createdAt: coinData.createdAt || new Date().toISOString(),
        isV4: true,
        autoRewardsEnabled: true
      }

    } catch (error) {
      console.error('Failed to fetch coin data:', error)
      return null
    }
  }

  /**
   * Get coins based on filter type
   */
  const getCoins = async (
    filter: 'trending' | 'new' | 'gainers' = 'trending', 
    limit: number = 20
  ): Promise<ZoraCoinData[]> => {
    switch (filter) {
      case 'new':
        return getNewCoins(limit)
      case 'gainers':
        return getTopGainers(limit)
      case 'trending':
      default:
        return getTopCoins(limit)
    }
  }

  /**
   * Buy a coin (this would integrate with Uniswap V4 in production)
   */
  const buyCoin = async (_coinAddress: string, _ethAmount: number): Promise<boolean> => {
    if (!isConnected || !address || !walletClient) {
      toast.error('Please connect your wallet first')
      return false
    }

    try {
      // This would integrate with Uniswap V4 router for actual swaps
      // For now, we'll simulate the transaction
      
      toast.success(
        <div className="flex items-center">
          <span className="mr-2">⚠️</span>
          <div>
            <p className="font-semibold">Feature Coming Soon</p>
            <p className="text-xs text-gray-400">Real trading via Uniswap V4 integration</p>
          </div>
        </div>,
        { duration: 3000 }
      )
      
      return true

    } catch (error: any) {
      console.error('Buy transaction failed:', error)
      toast.error(`Transaction failed: ${error.message}`)
      return false
    }
  }

  /**
   * Estimate gas for transactions
   */
  const estimateCreateCoinGas = async (_params: CreateCoinParams) => {
    if (!publicClient || !address) return null
    
    try {
      // This would estimate gas for the actual createCoin transaction
      // For now, return a reasonable estimate
      return BigInt(500000) // ~500k gas for coin creation
    } catch (error) {
      console.error('Gas estimation failed:', error)
      return null
    }
  }

  return {
    // Core functions
    createCoin,
    getCoinData,
    getCoins,
    getTopCoins,
    getNewCoins,
    getTopGainers,
    buyCoin,
    estimateCreateCoinGas,
    
    // Utilities
    uploadMetadataToIPFS,
    
    // State
    isCreating,
    isLoading,
    
    // Network info
    networkConfig,
    isConnected,
    address
  }
}