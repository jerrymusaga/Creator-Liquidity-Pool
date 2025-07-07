// hooks/useWallet.ts
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { useStore } from '@/stores/useStore'
import { isCorrectNetwork, getCurrentNetworkConfig, CURRENT_NETWORK } from '@/config/networks'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitchPending } = useSwitchChain()
  const chainId = useChainId()
  const { setUser } = useStore()

  const isOnCorrectNetwork = isCorrectNetwork(chainId)
  const networkConfig = getCurrentNetworkConfig()

  // Update user in store when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setUser({
        id: address,
        username: `${address.slice(0, 6)}...${address.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        isCreator: true,
        walletAddress: address,
        farcasterHandle: undefined
      })
    } else {
      setUser(null as any)
    }
  }, [isConnected, address, setUser])

  const connectWallet = async () => {
    try {
      // Get the preferred connector (MetaMask first, then others)
      const preferredConnector = connectors.find(
        connector => connector.name === 'MetaMask'
      ) || connectors[0]

      if (!preferredConnector) {
        toast.error('No wallet connectors available')
        return
      }

      await connect({ connector: preferredConnector })
      
      toast.success('Wallet connected successfully!', {
        duration: 2000,
        style: {
          background: '#1F2937',
          color: '#F3F4F6',
          border: '1px solid #8B5CF6',
        },
      })

    } catch (error: any) {
      console.error('Wallet connection failed:', error)
      toast.error(`Connection failed: ${error.message || 'Unknown error'}`)
    }
  }

  const disconnectWallet = () => {
    disconnect()
    toast.success('Wallet disconnected')
  }

  const switchToCorrectNetwork = async () => {
    if (!switchChain) {
      toast.error('Network switching not supported')
      return
    }

    try {
      await switchChain({ chainId: CURRENT_NETWORK.id })
      toast.success(`Switched to ${networkConfig.name}`)
    } catch (error: any) {
      console.error('Network switch failed:', error)
      toast.error(`Failed to switch to ${networkConfig.name}`)
    }
  }

  // Auto-prompt network switch when connected to wrong network
  useEffect(() => {
    if (isConnected && !isOnCorrectNetwork && !isSwitchPending) {
      const timer = setTimeout(() => {
        toast.error(
          `Wrong Network. Please switch to ${networkConfig.name}`,
          {
            duration: 5000,
            style: {
              background: '#1F2937',
              color: '#F3F4F6',
              border: '1px solid #EF4444',
            },
          }
        )
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isConnected, isOnCorrectNetwork, isSwitchPending, networkConfig.name])

  return {
    // Wallet state
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending,
    chainId,
    
    // Network state
    isOnCorrectNetwork,
    networkConfig,
    isSwitchPending,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
    
    // Available connectors
    connectors,
    
    // Helper methods
    getExplorerUrl: (txHash: string) => `${networkConfig.explorerUrl}/tx/${txHash}`,
    getAddressUrl: (address: string) => `${networkConfig.explorerUrl}/address/${address}`,
  }
}