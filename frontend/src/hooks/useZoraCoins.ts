// hooks/useZoraCoins.ts
import { useQuery } from '@tanstack/react-query';
import {
  getCoinsTopVolume24h,
  getCoinsMostValuable,
  getCoinsNew,
  getCoinsTopGainers,
  getCoinsLastTraded,
} from '@zoralabs/coins-sdk';
import { ZORA_CONFIG } from '@/config/zora';

interface QueryParams {
  count?: number;
  after?: string;
}

// Hook for fetching top volume coins
export function useTopVolumeCoins(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['zora-coins', 'top-volume', params],
    queryFn: async () => {
      const response = await getCoinsTopVolume24h({
        count: params.count || ZORA_CONFIG.defaultPageSize,
        after: params.after,
      });
      return response.data?.exploreList?.edges?.map((edge: any) => edge.node) || [];
    },
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for fetching most valuable coins
export function useMostValuableCoins(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['zora-coins', 'most-valuable', params],
    queryFn: async () => {
      const response = await getCoinsMostValuable({
        count: params.count || ZORA_CONFIG.defaultPageSize,
        after: params.after,
      });
      return response.data?.exploreList?.edges?.map((edge: any) => edge.node) || [];
    },
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for fetching new coins
export function useNewCoins(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['zora-coins', 'new', params],
    queryFn: async () => {
      const response = await getCoinsNew({
        count: params.count || ZORA_CONFIG.defaultPageSize,
        after: params.after,
      });
      return response.data?.exploreList?.edges?.map((edge: any) => edge.node) || [];
    },
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for fetching top gainers
export function useTopGainerCoins(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['zora-coins', 'top-gainers', params],
    queryFn: async () => {
      const response = await getCoinsTopGainers({
        count: params.count || ZORA_CONFIG.defaultPageSize,
        after: params.after,
      });
      return response.data?.exploreList?.edges?.map((edge: any) => edge.node) || [];
    },
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Hook for fetching recently traded coins
export function useRecentlyTradedCoins(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['zora-coins', 'recently-traded', params],
    queryFn: async () => {
      const response = await getCoinsLastTraded({
        count: params.count || ZORA_CONFIG.defaultPageSize,
        after: params.after,
      });
      return response.data?.exploreList?.edges?.map((edge: any) => edge.node) || [];
    },
    staleTime: ZORA_CONFIG.staleTime,
  });
}

// Combined hook for dashboard data
export function useDashboardCoins() {
  const topVolume = useTopVolumeCoins({ count: 10 });
  const newCoins = useNewCoins({ count: 10 });
  const topGainers = useTopGainerCoins({ count: 10 });
  const recentlyTraded = useRecentlyTradedCoins({ count: 10 });

  return {
    topVolume,
    newCoins,
    topGainers,
    recentlyTraded,
    isLoading: topVolume.isLoading || newCoins.isLoading || topGainers.isLoading || recentlyTraded.isLoading,
    isError: topVolume.isError || newCoins.isError || topGainers.isError || recentlyTraded.isError,
  };
}