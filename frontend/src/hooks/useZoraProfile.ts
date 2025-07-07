// hooks/useZoraProfile.ts
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { ZORA_CONFIG } from '@/config/zora';

// Note: These would need to be implemented when the SDK has profile endpoints
// For now, we'll create the structure and use mock data until official endpoints are available

interface ProfileQueryParams {
  address?: string;
  count?: number;
  after?: string;
}

// Hook for user's coin holdings - now using real SDK function
export function useUserCoinHoldings(params: ProfileQueryParams = {}) {
  const { address } = useAccount();
  const userAddress = params.address || address;

  return useQuery({
    queryKey: ['zora-profile', 'holdings', userAddress, params],
    queryFn: async () => {
      if (!userAddress) return [];
      
      try {
        console.log('🔍 Fetching user coin holdings for:', userAddress);
        
        // Import the Zora SDK function
        const { getProfileBalances } = await import('@zoralabs/coins-sdk');
        
        // Fetch user's coin balances
        const response = await getProfileBalances({
          identifier: userAddress,
          count: params.count || ZORA_CONFIG.defaultPageSize,
          after: params.after,
        });
        
        const profile: any = response.data?.profile;
        const balances = profile?.coinBalances?.edges?.map((edge: any) => ({
          coinAddress: edge.node.token?.address,
          balance: parseFloat(edge.node.amount?.amountDecimal || '0'),
          valueUsd: parseFloat(edge.node.valueUsd || '0'),
          coin: {
            address: edge.node.token?.address,
            name: edge.node.token?.name,
            symbol: edge.node.token?.symbol,
            image: edge.node.token?.media?.previewImage || edge.node.token?.media?.medium,
            currentPrice: 0, // TODO: Calculate from market data
            creator: {
              id: edge.node.token?.creatorAddress,
              address: edge.node.token?.creatorAddress,
            }
          },
          currentValue: parseFloat(edge.node.valueUsd || '0'),
          unrealizedPnL: 0, // TODO: Calculate P&L
          unrealizedPnLPercent: 0, // TODO: Calculate P&L percentage
        })) || [];
        
        console.log('✅ Found user holdings:', balances.length);
        return balances;
        
      } catch (error) {
        console.error('❌ Error fetching user holdings:', error);
        return [];
      }
    },
    enabled: !!userAddress,
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for user's transaction history (when SDK supports it)
export function useUserTransactions(params: ProfileQueryParams = {}) {
  const { address } = useAccount();
  const userAddress = params.address || address;

  return useQuery({
    queryKey: ['zora-profile', 'transactions', userAddress, params],
    queryFn: async () => {
      // TODO: Replace with actual SDK call when available
      // const response = await getUserTransactions({
      //   address: userAddress,
      //   count: params.count || ZORA_CONFIG.defaultPageSize,
      //   after: params.after,
      // });
      
      // For now, return empty array until SDK supports this
      console.warn('getUserTransactions not yet available in SDK');
      return [];
    },
    enabled: !!userAddress,
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for user's created coins - implemented with real fetching
export function useUserCreatedCoins(params: ProfileQueryParams = {}) {
  const { address } = useAccount();
  const userAddress = params.address || address;

  return useQuery({
    queryKey: ['zora-profile', 'created-coins', userAddress, params],
    queryFn: async () => {
      if (!userAddress) return [];
      
      try {
        console.log('🔍 Fetching user created coins for:', userAddress);
        
        // Import the Zora SDK functions
        const { getCoinsNew, getCoinsTopVolume24h, getCoinsTopGainers, getCoinsLastTraded, getCoinsLastTradedUnique, getCoinsMostValuable } = await import('@zoralabs/coins-sdk');
        
        // Fetch from multiple endpoints to increase chances of finding new coins
        const [recentCoinsResponse, popularCoinsResponse, gainersResponse, tradedResponse, uniqueTradedResponse, valuableResponse] = await Promise.all([
          getCoinsNew({ count: 100 }),
          getCoinsTopVolume24h({ count: 100 }),
          getCoinsTopGainers({ count: 100 }),
          getCoinsLastTraded({ count: 100 }),
          getCoinsLastTradedUnique({ count: 100 }),
          getCoinsMostValuable({ count: 100 })
        ]);
        
        // Combine all lists to search through
        const allCoins = [
          ...(recentCoinsResponse.data?.exploreList?.edges || []),
          ...(popularCoinsResponse.data?.exploreList?.edges || []),
          ...(gainersResponse.data?.exploreList?.edges || []),
          ...(tradedResponse.data?.exploreList?.edges || []),
          ...(uniqueTradedResponse.data?.exploreList?.edges || []),
          ...(valuableResponse.data?.exploreList?.edges || [])
        ];
        
        console.log('📋 Total coins to search through:', allCoins.length);
        
        // Remove duplicates by address and filter coins created by the user
        const uniqueCoins = new Map();
        allCoins.forEach((edge: any) => {
          const coin = edge.node;
          if (coin.address && !uniqueCoins.has(coin.address)) {
            uniqueCoins.set(coin.address, coin);
          }
        });
        
        const userCreatedCoins = Array.from(uniqueCoins.values())
          .filter((coin: any) => {
            const creatorAddress = coin.creatorAddress || coin.creator?.address;
            return creatorAddress?.toLowerCase() === userAddress.toLowerCase();
          })
          .map((coin: any) => {
            const creatorAddress = coin.creatorAddress || coin.creator?.address;
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
                address: creatorAddress,
                username: coin.creatorProfile?.handle || `${creatorAddress?.slice(0,6)}...${creatorAddress?.slice(-4)}` || 'Unknown',
                avatar: coin.creatorProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorAddress}`
              },
              createdAt: coin.createdAt || new Date().toISOString(),
              isV4: true,
              autoRewardsEnabled: true
            };
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
          
        console.log('✅ Found user created coins:', userCreatedCoins.length);
        console.log('📊 User coins:', userCreatedCoins.map(c => ({ name: c.name, symbol: c.symbol, address: c.address })));
        
        return userCreatedCoins;
        
      } catch (error) {
        console.error('❌ Error fetching user created coins:', error);
        return [];
      }
    },
    enabled: !!userAddress,
    staleTime: 10000, // Reduced stale time to 10 seconds for faster updates
    refetchInterval: 15000, // Refetch every 15 seconds to catch new coins faster
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  });
}

// Combined hook for user profile data
export function useUserProfile(address?: string) {
  const holdings = useUserCoinHoldings({ address });
  const transactions = useUserTransactions({ address });
  const createdCoins = useUserCreatedCoins({ address });

  const refreshProfile = () => {
    createdCoins.refetch();
    holdings.refetch();
    transactions.refetch();
  };

  return {
    holdings,
    transactions,
    createdCoins,
    isLoading: holdings.isLoading || transactions.isLoading || createdCoins.isLoading,
    isError: holdings.isError || transactions.isError || createdCoins.isError,
    refreshProfile,
  };
}

// Hook for calculating portfolio value from holdings
export function usePortfolioValue(address?: string) {
  const { holdings } = useUserProfile(address);

  return useQuery({
    queryKey: ['zora-profile', 'portfolio-value', address],
    queryFn: () => {
      if (!holdings.data) return 0;
      
      // Calculate total portfolio value
      return holdings.data.reduce((total: number, holding: any) => {
        return total + (holding.balance * holding.currentPrice);
      }, 0);
    },
    enabled: !!holdings.data,
    staleTime: ZORA_CONFIG.staleTime,
  });
}