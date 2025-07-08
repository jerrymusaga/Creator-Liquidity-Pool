// hooks/useZoraCoinCreation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient, usePublicClient } from 'wagmi';
import { createCoin as zoraCoinSDKCreateCoin, DeployCurrency, validateMetadataURIContent, type ValidMetadataURI } from '@zoralabs/coins-sdk';
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

      // Determine currency based on network (matching working implementation)
      const currentChainId = walletClient.chain?.id || networkConfig.chain.id;
      
      // Force ETH for Base Sepolia (84532), only use ZORA for Base mainnet (8453)
      let finalCurrency: DeployCurrency;
      if (currentChainId === 8453) {
        finalCurrency = params.currency || DeployCurrency.ZORA;
      } else {
        // For Base Sepolia and any other network, force ETH
        finalCurrency = DeployCurrency.ETH;
      }
      
      const { name, symbol, uri, payoutRecipient, platformReferrer } = params;

      // Validate metadata URI (skip validation to match working implementation)
      // The SDK will handle validation internally
      console.log('📋 Metadata URI:', uri);

      // Debug information
      console.log('🔍 Create coin debug info:');
      console.log('- Chain ID:', currentChainId);
      console.log('- Final Currency:', finalCurrency);
      console.log('- Requested Currency:', params.currency);
      console.log('- Wallet Chain:', walletClient.chain?.id);
      console.log('- Public Client Chain:', publicClient?.chain?.id);

      // Create coin parameters (matching working implementation)
      const coinParams = {
        name,
        symbol,
        uri: uri as ValidMetadataURI,
        payoutRecipient: payoutRecipient || walletClient.account.address,
        currency: finalCurrency,
        chainId: currentChainId,
        // Add platform referrer if available
        ...(platformReferrer && { platformReferrer })
      };

      console.log('📋 Coin parameters:', coinParams);

      // Create the coin using the same structure as the working simple test
      const result = await zoraCoinSDKCreateCoin(
        coinParams,
        walletClient,
        publicClient
      );

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
      queryClient.invalidateQueries({ queryKey: ['zora-profile', 'created-coins'] });
      
      return data;
    },
    onError: (error: any) => {
      console.error('Coin creation failed:', error);
      toast.error(`Failed to create coin: ${error.message}`, { id: 'create-coin' });
    },
  });
}

// Hook for uploading metadata to IPFS
export function useUploadMetadata() {
  return useMutation({
    mutationFn: async (metadata: {
      name: string;
      description: string;
      image: string;
      external_url?: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
      properties?: {
        coin_type?: string;
        creator?: string;
        social_links?: {
          twitter?: string;
          farcaster?: string;
          website?: string;
        };
      };
    }) => {
      const { uploadMetadataToIPFS } = await import('@/lib/ipfs');
      
      // Upload the metadata JSON to IPFS
      const result = await uploadMetadataToIPFS({
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        external_url: metadata.external_url,
        attributes: metadata.attributes || [],
        properties: metadata.properties || {},
      });
      
      return result.uri;
    },
    onMutate: () => {
      toast.loading('Uploading metadata to IPFS...', { id: 'upload-metadata' });
    },
    onSuccess: (uri) => {
      toast.success('Metadata uploaded to IPFS successfully!', { id: 'upload-metadata' });
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