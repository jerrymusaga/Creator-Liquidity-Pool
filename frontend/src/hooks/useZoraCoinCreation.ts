// hooks/useZoraCoinCreation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient, usePublicClient } from 'wagmi';
import { createCoin, DeployCurrency, validateMetadataURIContent } from '@zoralabs/coins-sdk';
import { Address } from 'viem';
import toast from 'react-hot-toast';
import { getCurrentNetworkConfig } from '@/config/networks';

interface CreateCoinParams {
  name: string;
  symbol: string;
  uri: string; // IPFS or other metadata URI
  payoutRecipient?: Address;
  platformReferrer?: Address;
  currency?: DeployCurrency;
}

export function useCreateCoin() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const networkConfig = getCurrentNetworkConfig();

  return useMutation({
    mutationFn: async (params: CreateCoinParams) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      const { name, symbol, uri, payoutRecipient, platformReferrer, currency = DeployCurrency.ZORA } = params;

      // Validate metadata URI
      try {
        await validateMetadataURIContent(uri);
      } catch (error) {
        throw new Error(`Invalid metadata URI: ${error}`);
      }

      // Create coin parameters
      const coinParams = {
        name,
        symbol,
        uri,
        payoutRecipient: payoutRecipient || walletClient.account.address,
        platformReferrer,
        chainId: networkConfig.chain.id,
        currency,
      };

      // Create the coin
      const result = await createCoin({
        publicClient,
        walletClient,
        ...coinParams,
      });

      return result;
    },
    onMutate: () => {
      toast.loading('Creating your coin...', { id: 'create-coin' });
    },
    onSuccess: (data) => {
      toast.success('Coin created successfully!', { id: 'create-coin' });
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['zora-coins'] });
      queryClient.invalidateQueries({ queryKey: ['zora-profile'] });
      
      return data;
    },
    onError: (error: any) => {
      console.error('Coin creation failed:', error);
      toast.error(`Failed to create coin: ${error.message}`, { id: 'create-coin' });
    },
  });
}

// Hook for uploading metadata to IPFS (would need additional setup)
export function useUploadMetadata() {
  return useMutation({
    mutationFn: async (metadata: {
      name: string;
      description: string;
      image: string;
      external_url?: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
    }) => {
      // TODO: Implement IPFS upload
      // This would typically use a service like Pinata, IPFS HTTP API, or Web3.Storage
      // For now, return a mock IPFS hash
      console.warn('IPFS upload not implemented. Using mock metadata URI.');
      
      // In a real implementation, you would:
      // 1. Upload the metadata JSON to IPFS
      // 2. Return the IPFS URI (ipfs://...)
      
      const mockHash = 'bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy';
      return `ipfs://${mockHash}`;
    },
    onMutate: () => {
      toast.loading('Uploading metadata...', { id: 'upload-metadata' });
    },
    onSuccess: (uri) => {
      toast.success('Metadata uploaded successfully!', { id: 'upload-metadata' });
      return uri;
    },
    onError: (error: any) => {
      console.error('Metadata upload failed:', error);
      toast.error(`Failed to upload metadata: ${error.message}`, { id: 'upload-metadata' });
    },
  });
}

// Combined hook for the full coin creation flow
export function useFullCoinCreation() {
  const uploadMetadata = useUploadMetadata();
  const createCoin = useCreateCoin();

  const createCoinWithMetadata = async (params: {
    coinData: Omit<CreateCoinParams, 'uri'>;
    metadata: {
      name: string;
      description: string;
      image: string;
      external_url?: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
    };
  }) => {
    try {
      // First upload metadata
      const uri = await uploadMetadata.mutateAsync(params.metadata);
      
      // Then create coin with the metadata URI
      const result = await createCoin.mutateAsync({
        ...params.coinData,
        uri,
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  return {
    createCoinWithMetadata,
    uploadMetadata,
    createCoin,
    isLoading: uploadMetadata.isPending || createCoin.isPending,
    isError: uploadMetadata.isError || createCoin.isError,
  };
}