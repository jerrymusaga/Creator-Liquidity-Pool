'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useSimulateContract, useWriteContract, useChainId } from 'wagmi';
import { createCoinCall, DeployCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Working coin creation using the successful approaches from the tests
 */
export const CoinCreationWorking: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [contractCallConfig, setContractCallConfig] = useState<unknown>(null);
  const [isPreparingContract, setIsPreparingContract] = useState(false);
  const [selectedApproach, setSelectedApproach] = useState<'simple-metadata' | 'no-referrer' | 'chain-currency' | 'explicit-owners'>('simple-metadata');

  const getWorkingParams = () => {
    if (!address) return null;
    
    const baseParams = {
      payoutRecipient: address,
      currency: DeployCurrency.ETH,
    };

    switch (selectedApproach) {
      case 'simple-metadata':
        const simpleMetadata = {
          name: "Working Test Coin",
          description: "A working test coin created successfully",
          image: "https://via.placeholder.com/300x300.png?text=Working"
        };
        return {
          ...baseParams,
          name: "Working Test Coin",
          symbol: "WORK",
          uri: `data:application/json;base64,${btoa(JSON.stringify(simpleMetadata))}` as ValidMetadataURI,
        };

      case 'no-referrer':
        return {
          ...baseParams,
          name: "No Referrer Coin",
          symbol: "NOREF",
          uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        };

      case 'chain-currency':
        return {
          ...baseParams,
          name: "Chain Currency Coin",
          symbol: "CHAIN",
          uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
          currency: chainId === base.id ? DeployCurrency.ZORA : DeployCurrency.ETH,
          chainId: chainId,
        };

      case 'explicit-owners':
        return {
          ...baseParams,
          name: "Explicit Owners Coin",
          symbol: "OWNERS",
          uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
          owners: [address],
        };

      default:
        return null;
    }
  };

  const prepareContractCall = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const coinParams = getWorkingParams();
    if (!coinParams) {
      toast.error('Invalid parameters');
      return;
    }

    setIsPreparingContract(true);

    try {
      toast.loading('Preparing working contract call...', { id: 'prepare' });
      
      console.log('🎯 Using working approach:', selectedApproach);
      console.log('🎯 Params:', coinParams);
      
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('🎯 Contract call prepared successfully:', contractCallParams);
      
      setContractCallConfig(contractCallParams);
      
      toast.success('Working contract call prepared!', { id: 'prepare' });
    } catch (error: unknown) {
      console.error('❌ Failed to prepare contract call:', error);
      toast.error(`Failed to prepare: ${error instanceof Error ? error.message : String(error)}`, { id: 'prepare' });
    } finally {
      setIsPreparingContract(false);
    }
  };

  // Simulate contract call
  const { 
    data: writeConfig, 
    error: simulateError,
    isLoading: isSimulating 
  } = useSimulateContract({
    ...(contractCallConfig as object),
    query: {
      enabled: !!contractCallConfig,
    }
  });

  // Write contract
  const { writeContract, isPending, isSuccess, error: writeError } = useWriteContract();

  // Handle coin creation
  const handleCreateCoin = () => {
    if (!writeConfig) {
      toast.error('Contract not ready. Please prepare first.');
      return;
    }

    if (simulateError) {
      console.error('❌ Simulation error:', simulateError);
      toast.error(`Simulation failed: ${simulateError.message}`);
      return;
    }

    try {
      console.log('🚀 Executing working coin creation');
      writeContract(writeConfig.request);
    } catch (error: unknown) {
      console.error('❌ Write contract error:', error);
      toast.error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Coin created successfully using working approach!');
    }
  }, [isSuccess]);

  // Handle write error
  React.useEffect(() => {
    if (writeError) {
      console.error('❌ Write error:', writeError);
      toast.error(`Transaction failed: ${writeError.message}`);
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🎯 Working Coin Creation</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to continue.</p>
      </Card>
    );
  }

  const coinParams = getWorkingParams();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🎯 Working Coin Creation</h2>
      
      <div className="space-y-4">
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-2">🎉 Success!</h3>
          <p className="text-sm text-gray-300">
            Found 4 working approaches! Select one below to create your coin.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Select Working Approach:</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="simple-metadata"
                checked={selectedApproach === 'simple-metadata'}
                onChange={(e) => setSelectedApproach(e.target.value as any)}
                className="text-vibe-purple"
              />
              <span className="text-sm">Simple Metadata URI (data URI with basic info)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="no-referrer"
                checked={selectedApproach === 'no-referrer'}
                onChange={(e) => setSelectedApproach(e.target.value as any)}
                className="text-vibe-purple"
              />
              <span className="text-sm">No Platform Referrer (remove referrer param)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="chain-currency"
                checked={selectedApproach === 'chain-currency'}
                onChange={(e) => setSelectedApproach(e.target.value as any)}
                className="text-vibe-purple"
              />
              <span className="text-sm">Chain-Appropriate Currency ({chainId === base.id ? 'ZORA' : 'ETH'})</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="explicit-owners"
                checked={selectedApproach === 'explicit-owners'}
                onChange={(e) => setSelectedApproach(e.target.value as any)}
                className="text-vibe-purple"
              />
              <span className="text-sm">Explicit Owners Array (include owners param)</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Current Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Name:</span> {coinParams?.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {coinParams?.symbol}</p>
            <p><span className="text-gray-400">Currency:</span> {coinParams?.currency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'}</p>
            <p><span className="text-gray-400">Chain:</span> {chainId === base.id ? 'Base Mainnet' : 'Base Sepolia'}</p>
            <p><span className="text-gray-400">Approach:</span> {selectedApproach.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={prepareContractCall}
            disabled={!isConnected || isPreparingContract}
            className="w-full"
          >
            {isPreparingContract ? 'Preparing...' : '1. Prepare Working Contract Call'}
          </Button>

          <Button 
            onClick={handleCreateCoin}
            disabled={!writeConfig || isPending || !contractCallConfig || isSimulating}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isPending ? 'Creating...' : isSimulating ? 'Simulating...' : '2. Create Coin (Working Method)'}
          </Button>
        </div>

        {simulateError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Simulation Error:</h4>
            <p className="text-red-400 text-sm">{simulateError.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              Try a different approach above if this one fails.
            </p>
          </div>
        )}

        {writeError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Write Error:</h4>
            <p className="text-red-400 text-sm">{writeError.message}</p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
          <h4 className="font-semibold text-blue-400 mb-2">Status:</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>Contract Config: {contractCallConfig ? '✅' : '❌'}</p>
            <p>Simulation: {writeConfig ? '✅' : isSimulating ? '⏳' : '❌'}</p>
            <p>Ready to Create: {writeConfig && !isSimulating ? '✅' : '❌'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};