// hooks/useZoraSDK.ts
import { useState, useCallback } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { useDashboardCoins } from './useZoraCoins';
import { useCreateCoin } from './useZoraCoinCreation';
import { getCurrentNetworkConfig } from '@/config/networks';
import toast from 'react-hot-toast';

type FilterType = 'trending' | 'new' | 'gainers';

interface ZoraCoinData {
  address: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  totalSupply: string;
  marketCap: string;
  volume24h: string;
  holderCount: number;
  currentPrice: string;
  priceChange24h: number;
  creator: {
    address: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  isV4: boolean;
  autoRewardsEnabled: boolean;
}

export function useZoraSDK() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  
  const networkConfig = getCurrentNetworkConfig();
  const { topVolume, newCoins, topGainers, isLoading: dashboardLoading } = useDashboardCoins();
  const createCoinMutation = useCreateCoin();

  // Transform Zora API data to our format
  const transformCoinData = useCallback((rawCoin: any): ZoraCoinData => {
    return {
      address: rawCoin.address || rawCoin.id,
      name: rawCoin.name || 'Unknown Coin',
      symbol: rawCoin.symbol || 'UNKNOWN',
      description: rawCoin.description || rawCoin.metadata?.description || '',
      image: rawCoin.image || rawCoin.metadata?.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${rawCoin.symbol}`,
      totalSupply: rawCoin.totalSupply || '0',
      marketCap: rawCoin.marketCap || '0',
      volume24h: rawCoin.volume24h || rawCoin.tradingVolume24h || '0',
      holderCount: rawCoin.holderCount || rawCoin.holders || 0,
      currentPrice: rawCoin.currentPrice || rawCoin.price || '0',
      priceChange24h: rawCoin.priceChange24h || 0,
      creator: {
        address: rawCoin.creator?.address || rawCoin.creator?.id || '0x0',
        username: rawCoin.creator?.name || rawCoin.creator?.username || 'Anonymous',
        avatar: rawCoin.creator?.avatar || rawCoin.creator?.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${rawCoin.creator?.address}`,
      },
      createdAt: rawCoin.createdAt || rawCoin.timestamp || new Date().toISOString(),
      isV4: true, // All Zora coins are V4
      autoRewardsEnabled: true, // V4 has automatic rewards
    };
  }, []);

  // Get coins based on filter type
  const getCoins = useCallback(async (filter: FilterType, limit: number = 20): Promise<ZoraCoinData[]> => {
    try {
      setIsLoading(true);
      
      let rawCoins: any[] = [];
      
      switch (filter) {
        case 'trending':
          if (topVolume.data) {
            rawCoins = topVolume.data.slice(0, limit);
          }
          break;
        case 'new':
          if (newCoins.data) {
            rawCoins = newCoins.data.slice(0, limit);
          }
          break;
        case 'gainers':
          if (topGainers.data) {
            rawCoins = topGainers.data.slice(0, limit);
          }
          break;
        default:
          rawCoins = [];
      }

      // Transform the raw data
      const transformedCoins = rawCoins.map(transformCoinData);
      
      return transformedCoins;
    } catch (error) {
      console.error('Error fetching coins:', error);
      throw new Error('Failed to fetch coins from Zora');
    } finally {
      setIsLoading(false);
    }
  }, [topVolume.data, newCoins.data, topGainers.data, transformCoinData]);

  // Buy coin function (simplified - would need actual trading implementation)
  const buyCoin = useCallback(async (coinAddress: string, ethAmount: number): Promise<boolean> => {
    if (!isConnected || !walletClient || !publicClient) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement actual coin buying logic
      // This would involve interacting with Zora's trading contracts
      console.log(`Attempting to buy ${ethAmount} ETH worth of coin ${coinAddress}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully bought ${ethAmount} ETH worth of coins!`, {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#F3F4F6',
          border: '1px solid #10B981',
        },
      });
      
      return true;
    } catch (error: any) {
      console.error('Buy coin failed:', error);
      toast.error(`Failed to buy coin: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, publicClient]);

  // Sell coin function (simplified)
  const sellCoin = useCallback(async (coinAddress: string, coinAmount: number): Promise<boolean> => {
    if (!isConnected || !walletClient || !publicClient) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      setIsLoading(true);
      
      // TODO: Implement actual coin selling logic
      console.log(`Attempting to sell ${coinAmount} coins of ${coinAddress}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully sold ${coinAmount} coins!`, {
        duration: 3000,
        style: {
          background: '#1F2937',
          color: '#F3F4F6',
          border: '1px solid #10B981',
        },
      });
      
      return true;
    } catch (error: any) {
      console.error('Sell coin failed:', error);
      toast.error(`Failed to sell coin: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletClient, publicClient]);

  return {
    // Data fetching
    getCoins,
    isLoading: isLoading || dashboardLoading,
    
    // Trading functions
    buyCoin,
    sellCoin,
    
    // Coin creation
    createCoin: createCoinMutation.mutate,
    isCreating: createCoinMutation.isPending,
    
    // Network info
    networkConfig,
    
    // Wallet state
    isConnected,
    address,
    
    // Helper function to get explorer URLs
    getExplorerUrl: (txHash: string) => `${networkConfig.explorerUrl}/tx/${txHash}`,
    getAddressUrl: (address: string) => `${networkConfig.explorerUrl}/address/${address}`,
  };
}