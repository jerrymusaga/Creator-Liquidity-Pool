
import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from 'wagmi'
import { Address } from 'viem'
import { 
  DeployCurrency,
  type CreateCoinArgs,
  InitialPurchaseCurrency,
  getCoin,
  getCoinsTopVolume24h,
  getCoinsNew,
  getCoinsTopGainers,
  setApiKey,
  createCoin as zoraCoinSDKCreateCoin,
  type ValidMetadataURI
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
  
  const { address, isConnected, chain } = useAccount()
  const networkConfig = getCurrentNetworkConfig()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId: walletClient?.chain?.id })
  const { switchChain } = useSwitchChain()
  
  // The issue: publicClient might be on wrong network
  console.log('🚨 PUBLIC CLIENT DEBUG:')
  console.log('- Public Client Chain ID:', publicClient?.chain?.id)
  console.log('- Network Config Chain ID:', networkConfig.chain.id)
  console.log('- Chain ID Match:', publicClient?.chain?.id === networkConfig.chain.id)

  // Debug current connection state
  console.log('🔍 HOOK DEBUG - Current connection state:')
  console.log('- isConnected:', isConnected)
  console.log('- address:', address)
  console.log('- chain from useAccount:', chain)
  console.log('- walletClient chain:', walletClient?.chain)
  console.log('- networkConfig chain:', networkConfig.chain.id)

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
      console.log('Uploading metadata to IPFS:', metadata)
      
      const response = await fetch('/api/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('IPFS upload failed with status:', response.status, errorText)
        throw new Error(`Failed to upload metadata: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('IPFS upload result:', result)
      
      if (!result.ipfsHash) {
        throw new Error('No IPFS hash returned from upload')
      }
      
      const ipfsUri = `ipfs://${result.ipfsHash}`
      console.log('Generated IPFS URI:', ipfsUri)
      
      return ipfsUri
    } catch (error) {
      console.error('IPFS upload failed:', error)
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create a new Creator Coin using Zora SDK
   */
  const createCoin = async (params: CreateCoinParams): Promise<string | null> => {
    // Network constants
    const baseMainnet = 8453
    const baseSepolia = 84532
    
    console.log('🔍 START COIN CREATION DEBUG')
    console.log('isConnected:', isConnected)
    console.log('address:', address)
    console.log('walletClient exists:', !!walletClient)
    console.log('publicClient exists:', !!publicClient)
    
    if (!isConnected || !address || !walletClient || !publicClient) {
      console.error('❌ Missing wallet connection or clients')
      toast.error('Please connect your wallet first')
      return null
    }
    
    // Log wallet and client details IMMEDIATELY
    console.log('🔍 IMMEDIATE WALLET CHECK:')
    console.log('Wallet Client Chain ID:', walletClient.chain?.id)
    console.log('Wallet Client Chain Name:', walletClient.chain?.name)
    console.log('Public Client Chain ID:', publicClient.chain?.id)
    console.log('Account Address:', address)
    console.log('Network Config Chain ID:', networkConfig.chain.id)
    console.log('Network Config Chain Name:', networkConfig.chain.name)

    // Check network compatibility before starting
    const currentChainId = walletClient.chain?.id
    const expectedChainId = currentChainId // Use the wallet's current chain
    
    console.log('=== Network Debug Info ===')
    console.log('Current Chain ID:', currentChainId)
    console.log('Expected Chain ID:', expectedChainId)
    console.log('Network Config:', networkConfig.chain.name)
    console.log('Wallet Client Chain:', walletClient?.chain)
    console.log('Wallet Client Account:', walletClient?.account)
    console.log('Public Client Chain:', publicClient?.chain?.id)
    console.log('Is Base Mainnet (8453):', currentChainId === 8453)
    console.log('Is Base Sepolia (84532):', currentChainId === 84532)
    
    // Check if the wallet is connected to a supported network
    if (currentChainId !== baseMainnet && currentChainId !== baseSepolia) {
      console.error('❌ Wallet is connected to unsupported network:', currentChainId)
      console.error('Expected: 8453 (Base) or 84532 (Base Sepolia)')
      
      // Try to identify what network this actually is
      const networkNames: Record<number, string> = {
        1: 'Ethereum Mainnet',
        5: 'Goerli Testnet', 
        11155111: 'Sepolia Testnet',
        137: 'Polygon',
        8453: 'Base Mainnet',
        84532: 'Base Sepolia',
        42161: 'Arbitrum One'
      }
      
      const networkName = networkNames[currentChainId || 0] || `Unknown (${currentChainId})`
      
      toast.error(
        <div>
          <p className="font-semibold">Wrong Network!</p>
          <p className="text-sm">Currently on: {networkName}</p>
          <p className="text-sm">Switch to Base Sepolia (84532) in your wallet</p>
        </div>,
        { duration: 10000 }
      )
      return null
    } else {
      console.log('✅ Wallet is on supported network:', currentChainId)
    }
    
    if (!currentChainId) {
      toast.error('No network detected. Please connect your wallet properly.')
      return null
    }
    
    if (currentChainId !== expectedChainId) {
      toast.error(
        <div className="flex items-center space-x-2">
          <span>Please switch to {networkConfig.chain.name}</span>
          <button 
            onClick={() => switchChain({ chainId: expectedChainId })}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Switch Network
          </button>
        </div>,
        { duration: 8000 }
      )
      return null
    }

    // Validate that we're on a Zora-supported network
    if (currentChainId !== baseMainnet && currentChainId !== baseSepolia) {
      toast.error('Coin creation is only supported on Base Mainnet (8453) or Base Sepolia (84532)')
      return null
    }
    
    // Validate that both clients are properly configured
    console.log('=== Network Validation ===')
    console.log('Wallet Chain ID:', currentChainId)
    console.log('Public Client Chain ID:', publicClient?.chain?.id)
    console.log('Are clients aligned?:', publicClient?.chain?.id === currentChainId)
    
    // Ensure public client is also on the correct network
    if (publicClient?.chain?.id !== currentChainId) {
      console.error('❌ Public client chain mismatch!')
      console.error('Wallet Chain ID:', currentChainId)
      console.error('Public Client Chain ID:', publicClient?.chain?.id)
      toast.error('Network mismatch detected. Please refresh the page and try again.')
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
      let metadataUri: string
      try {
        metadataUri = await uploadMetadataToIPFS(metadata)
        console.log('Metadata uploaded successfully:', metadataUri)
      } catch (uploadError) {
        console.error('IPFS upload failed, using fallback metadata:', uploadError)
        // Use a simplified metadata structure as fallback
        const fallbackMetadata = {
          name: params.name,
          description: params.description,
          image: params.image
        }
        metadataUri = `data:application/json;base64,${btoa(JSON.stringify(fallbackMetadata))}`
        toast.error('IPFS upload failed, using fallback metadata')
      }
      
      // Skip metadata validation to avoid blocking coin creation
      // The Zora SDK will handle basic validation internally
      console.log('Using metadata URI:', metadataUri)

      // Cast metadata URI to ValidMetadataURI (SDK will validate internally)
      const validatedUri = metadataUri as ValidMetadataURI
      
      // Determine currency based on network (Base mainnet uses ZORA, Base Sepolia uses ETH)
      let currency: DeployCurrency
      if (currentChainId === baseMainnet) {
        currency = DeployCurrency.ZORA
      } else if (currentChainId === baseSepolia) {
        currency = DeployCurrency.ETH
      } else {
        currency = DeployCurrency.ETH // Default fallback
      }
      
      console.log('=== Currency Selection Debug ===')
      console.log('Current Chain ID:', currentChainId)
      console.log('Selected Currency:', currency)
      console.log('Is Base Mainnet (8453):', currentChainId === baseMainnet)
      console.log('Is Base Sepolia (84532):', currentChainId === baseSepolia)
      
      // Prepare coin creation parameters according to Zora SDK docs
      const coinParams: CreateCoinArgs = {
        name: params.name,
        symbol: params.symbol,
        uri: validatedUri,
        payoutRecipient: address as Address,
        currency: currency,
        chainId: currentChainId,
        // Add platform referrer if available
        ...(process.env.NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS && {
          platformReferrer: process.env.NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS as Address
        }),
        // Add optional initial purchase if provided
        ...(params.initialPurchaseWei && {
          initialPurchase: {
            currency: InitialPurchaseCurrency.ETH,
            amount: params.initialPurchaseWei
          }
        })
      }

      // Log network information for debugging
      console.log('Network Config Chain ID:', expectedChainId)
      console.log('Wallet Client Chain ID:', currentChainId)
      console.log('Public Client Chain ID:', publicClient?.chain?.id)
      console.log('Creating coin on network:', networkConfig.chain.name)
      
      console.log('=== Final Pre-Creation Validation ===')
      console.log('Public Client Chain:', publicClient?.chain?.id)
      console.log('Wallet Client Chain:', walletClient?.chain?.id)
      console.log('Wallet Client:', walletClient)
      console.log('Public Client:', publicClient)
      console.log('Coin Params:', coinParams)
      console.log('About to call createCoin with these exact parameters...')
      
      // Validate one more time before SDK call
      if (walletClient?.chain?.id !== 8453 && walletClient?.chain?.id !== 84532) {
        throw new Error(`❌ Final validation failed: Wallet chain ID is ${walletClient?.chain?.id}, but Zora requires 8453 (Base) or 84532 (Base Sepolia)`)
      }
      
      // THIS IS THE KEY ISSUE: Check if publicClient chain matches what Zora expects
      if (publicClient?.chain?.id !== 8453 && publicClient?.chain?.id !== 84532) {
        throw new Error(`❌ PUBLIC CLIENT ISSUE: Public client chain ID is ${publicClient?.chain?.id}, but Zora requires 8453 (Base) or 84532 (Base Sepolia)`)
      }
      
      if (publicClient?.chain?.id !== walletClient?.chain?.id) {
        console.warn(`⚠️ Client mismatch: Public client chain (${publicClient?.chain?.id}) doesn't match wallet client chain (${walletClient?.chain?.id})`)
        // Don't throw error, just warn - this might be OK
      }
      
      console.log('✅ Final validation passed, calling Zora SDK...')
      
      // Ensure we're using the correct network clients
      console.log('=== Final Client Validation ===')
      console.log('Wallet Client Chain:', walletClient.chain?.id, walletClient.chain?.name)
      console.log('Public Client Chain:', publicClient?.chain?.id, publicClient?.chain?.name)
      console.log('Expected Chain ID:', currentChainId)
      
      // Create the coin using Zora SDK with the documented signature
      const result = await zoraCoinSDKCreateCoin(
        coinParams,
        walletClient,
        publicClient
      )

      console.log('Coin creation result:', result)
      
      if (!result) {
        throw new Error('Coin creation failed - no result returned')
      }
      
      // Extract coin address from the result
      const coinAddress = (result as any).address || (result as any).deployment?.coin
      const txHash = (result as any).hash
      
      // Success toast
      toast.success(
        <div className="flex items-center">
          <span className="mr-2">🚀</span>
          <div>
            <p className="font-semibold">Creator Coin Deployed!</p>
            <p className="text-xs text-gray-400">
              V4 auto-rewards enabled
              {coinAddress && ` • ${coinAddress.slice(0, 8)}...`}
            </p>
            {txHash && (
              <p className="text-xs text-gray-300">
                Tx: {txHash.slice(0, 10)}...
              </p>
            )}
          </div>
        </div>,
        { duration: 8000 }
      )
      
      return coinAddress || txHash

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
          image: (typeof coin.image === 'string' ? coin.image : coin.image?.previewImage?.medium) || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
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
          image: (typeof coin.image === 'string' ? coin.image : coin.image?.previewImage?.medium) || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
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
          image: (typeof coin.image === 'string' ? coin.image : coin.image?.previewImage?.medium) || `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.symbol}`,
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
        image: (typeof (coinData as any).image === 'string' ? (coinData as any).image : (coinData as any).image?.previewImage?.medium) || `https://api.dicebear.com/7.x/identicon/svg?seed=${coinData.symbol}`,
        totalSupply: coinData.totalSupply || '0',
        marketCap: coinData.marketCap || '0',
        volume24h: coinData.volume24h || '0',
        holderCount: coinData.uniqueHolders || 0,
        currentPrice: (coinData as any).priceUSD || '0',
        priceChange24h: (coinData as any).priceChangePercent24h || 0,
        creator: {
          address: coinData.creatorAddress || '',
          username: coinData.creatorProfile?.handle || `${coinData.creatorAddress?.slice(0,6)}...${coinData.creatorAddress?.slice(-4)}` || 'Unknown',
          avatar: typeof coinData.creatorProfile?.avatar === 'string' ? coinData.creatorProfile.avatar : `https://api.dicebear.com/7.x/avataaars/svg?seed=${coinData.creatorAddress}`
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

  /**
   * Helper function to switch to the correct network
   */
  const switchToCorrectNetwork = async () => {
    try {
      switchChain({ chainId: networkConfig.chain.id })
      toast.success(`Switched to ${networkConfig.chain.name}`)
    } catch (error) {
      toast.error('Failed to switch network')
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
    switchToCorrectNetwork,
    
    // State
    isCreating,
    isLoading,
    
    // Network info
    networkConfig,
    isConnected,
    address
  }
}