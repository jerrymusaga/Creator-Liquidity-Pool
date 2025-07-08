// hooks/useZoraCoinCreationWagmi.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccount, useSimulateContract, useWriteContract } from 'wagmi';
import { 
  createCoinCall, 
  DeployCurrency, 
  InitialPurchaseCurrency,
  type ValidMetadataURI 
} from '@zoralabs/coins-sdk';
import { Address, parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';
import { getCurrentNetworkConfig } from '@/config/networks';
import { useState, useEffect } from 'react';

interface CreateCoinParams {
  name: string;
  symbol: string;
  uri: string; // IPFS or other metadata URI
  payoutRecipient?: Address;
  platformReferrer?: Address;
  currency?: DeployCurrency;
  initialPurchase?: {
    currency: InitialPurchaseCurrency;
    amount: bigint;
    amountOutMinimum?: bigint;
  };
}

interface CreateCoinResult {
  hash: string;
  address?: string;
}

export function useCreateCoinWagmi() {
  const { address, isConnected, chain } = useAccount();
  const queryClient = useQueryClient();
  const networkConfig = getCurrentNetworkConfig();
  const [contractCallConfig, setContractCallConfig] = useState<any>(null);
  const [isPreparingContract, setIsPreparingContract] = useState(false);

  // Prepare contract call configuration
  const prepareContractCall = async (params: CreateCoinParams) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsPreparingContract(true);
    
    try {
      // Determine currency based on network
      const currentChainId = chain?.id || networkConfig.chain.id;
      
      let finalCurrency: DeployCurrency;
      if (currentChainId === base.id) {
        finalCurrency = params.currency || DeployCurrency.ZORA;
      } else {
        // For Base Sepolia and any other network, force ETH
        finalCurrency = DeployCurrency.ETH;
      }

      // Create coin parameters
      const coinParams = {
        name: params.name,
        symbol: params.symbol,
        uri: params.uri as ValidMetadataURI,
        payoutRecipient: params.payoutRecipient || address,
        currency: finalCurrency,
        chainId: currentChainId,
        ...(params.platformReferrer && { platformReferrer: params.platformReferrer }),
        ...(params.initialPurchase && { initialPurchase: params.initialPurchase })
      };

      console.log('📋 Preparing WAGMI contract call with params:', coinParams);

      // Create contract call configuration
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('📋 Contract call params:', contractCallParams);
      
      setContractCallConfig(contractCallParams);
      return contractCallParams;
    } catch (error) {
      console.error('Failed to prepare contract call:', error);
      throw error;
    } finally {
      setIsPreparingContract(false);
    }
  };

  // Simulate contract call
  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating
  } = useSimulateContract({
    ...contractCallConfig,
    query: {
      enabled: !!contractCallConfig,
    }
  });

  // Write contract
  const {
    writeContract,
    data: writeData,
    error: writeError,
    isPending: isWriting,
    isSuccess: isWriteSuccess
  } = useWriteContract();

  // Create coin mutation
  const createCoinMutation = useMutation({
    mutationFn: async (params: CreateCoinParams) => {
      // First prepare the contract call
      await prepareContractCall(params);
      
      // Wait for simulation to complete
      if (simulateError) {
        throw new Error(`Contract simulation failed: ${simulateError.message}`);
      }

      if (!simulateData) {
        throw new Error('Contract simulation data not available');
      }

      // Execute the contract write
      writeContract(simulateData.request);

      // Return a promise that resolves when the transaction is complete
      return new Promise<CreateCoinResult>((resolve, reject) => {
        const checkWriteStatus = () => {
          if (isWriteSuccess && writeData) {
            resolve({
              hash: writeData,
              // Note: We'll need to extract the address from transaction receipt
              // This would require additional logic to parse the transaction logs
            });
          } else if (writeError) {
            reject(writeError);
          } else {
            // Continue checking
            setTimeout(checkWriteStatus, 100);
          }
        };
        checkWriteStatus();
      });
    },
    onMutate: () => {
      toast.loading('Creating your coin...', { id: 'create-coin-wagmi' });
    },
    onSuccess: (data) => {
      toast.success('Coin created successfully!', { id: 'create-coin-wagmi' });
      
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['zora-coins'] });
      queryClient.invalidateQueries({ queryKey: ['zora-profile'] });
      queryClient.invalidateQueries({ queryKey: ['zora-profile', 'created-coins'] });
      
      return data;
    },
    onError: (error: any) => {
      console.error('Coin creation failed:', error);
      toast.error(`Failed to create coin: ${error.message}`, { id: 'create-coin-wagmi' });
    },
  });

  return {
    createCoin: createCoinMutation.mutateAsync,
    createCoinMutation,
    isLoading: createCoinMutation.isPending || isPreparingContract || isSimulating || isWriting,
    isPreparingContract,
    isSimulating,
    isWriting,
    simulateData,
    simulateError,
    writeData,
    writeError,
    contractCallConfig,
    prepareContractCall
  };
}

// Hook for uploading metadata to IPFS (same as before)
export function useUploadMetadataWagmi() {
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
      toast.loading('Uploading metadata to IPFS...', { id: 'upload-metadata-wagmi' });
    },
    onSuccess: (uri) => {
      toast.success('Metadata uploaded to IPFS successfully!', { id: 'upload-metadata-wagmi' });
      return uri;
    },
    onError: (error: any) => {
      console.error('Metadata upload failed:', error);
      toast.error(`Failed to upload metadata: ${error.message}`, { id: 'upload-metadata-wagmi' });
    },
  });
}

// Combined hook for the full coin creation flow with WAGMI
export function useFullCoinCreationWagmi() {
  const uploadMetadata = useUploadMetadataWagmi();
  const createCoin = useCreateCoinWagmi();

  const createCoinWithMetadata = async (params: {
    coinData: Omit<CreateCoinParams, 'uri'>;
    metadata: {
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
    };
  }) => {
    try {
      // First upload metadata
      const uri = await uploadMetadata.mutateAsync(params.metadata);
      
      // Then create coin with the metadata URI
      const result = await createCoin.createCoin({
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
    isLoading: uploadMetadata.isPending || createCoin.isLoading,
    isError: uploadMetadata.isError || createCoin.createCoinMutation.isError,
  };
}