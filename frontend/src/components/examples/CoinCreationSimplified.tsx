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
 * Simplified version to avoid contract revert errors
 */
export const CoinCreationSimplified: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [contractCallConfig, setContractCallConfig] = useState<unknown>(null);
  const [isPreparingContract, setIsPreparingContract] = useState(false);

  // Determine appropriate currency based on chain
  const isBaseMainnet = chainId === base.id;
  const currency = isBaseMainnet ? DeployCurrency.ZORA : DeployCurrency.ETH;

  // Minimal coin parameters to avoid revert errors
  const createMinimalCoinParams = () => {
    if (!address) return null;
    
    // Use only the absolutely required parameters
    return {
      name: "Simple Test Coin",
      symbol: "STC",
      uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
      payoutRecipient: address,
      currency,
      // Don't include chainId to let SDK determine
      // Don't include platformReferrer initially
      // Don't include initialPurchase initially
    };
  };

  // Prepare contract call configuration
  const prepareContractCall = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const coinParams = createMinimalCoinParams();
    if (!coinParams) {
      toast.error('Invalid parameters');
      return;
    }

    setIsPreparingContract(true);

    try {
      toast.loading('Preparing simplified contract call...', { id: 'prepare' });
      
      console.log('🔍 Minimal params:', coinParams);
      console.log('🔍 Chain ID:', chainId);
      console.log('🔍 Is Base Mainnet:', isBaseMainnet);
      console.log('🔍 Currency:', currency);
      
      // Create configuration for wagmi using createCoinCall
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('🔍 Contract call result:', contractCallParams);
      console.log('🔍 Function name:', contractCallParams.functionName);
      console.log('🔍 Address:', contractCallParams.address);
      console.log('🔍 Args:', contractCallParams.args);
      console.log('🔍 Args length:', contractCallParams.args?.length);
      
      setContractCallConfig(contractCallParams);
      
      toast.success('Contract call prepared!', { id: 'prepare' });
    } catch (error: unknown) {
      console.error('❌ Failed to prepare contract call:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
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
      console.log('🚀 Executing writeContract with:', writeConfig.request);
      writeContract(writeConfig.request);
    } catch (error: unknown) {
      console.error('❌ Write contract error:', error);
      toast.error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Simple coin created successfully! 🎉');
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
        <h2 className="text-xl font-bold mb-4">Simplified Coin Creation</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to continue.</p>
      </Card>
    );
  }

  const coinParams = createMinimalCoinParams();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🔧 Simplified Coin Creation</h2>
      
      <div className="space-y-4">
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-2">Strategy</h3>
          <p className="text-sm text-gray-300">
            Using minimal parameters to avoid contract revert errors. 
            Once this works, we can add platformReferrer and initialPurchase.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Coin Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Name:</span> {coinParams?.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {coinParams?.symbol}</p>
            <p><span className="text-gray-400">Currency:</span> {currency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'}</p>
            <p><span className="text-gray-400">Chain:</span> {isBaseMainnet ? 'Base Mainnet' : 'Base Sepolia'}</p>
            <p><span className="text-gray-400">Chain ID:</span> {chainId}</p>
            <p><span className="text-gray-400">Payout Recipient:</span> {address?.slice(0, 8)}...{address?.slice(-6)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={prepareContractCall}
            disabled={!isConnected || isPreparingContract}
            className="w-full"
          >
            {isPreparingContract ? 'Preparing...' : '1. Prepare Minimal Contract Call'}
          </Button>

          <Button 
            onClick={handleCreateCoin}
            disabled={!writeConfig || isPending || !contractCallConfig || isSimulating}
            className="w-full"
          >
            {isPending ? 'Creating...' : isSimulating ? 'Simulating...' : '2. Create Simple Coin'}
          </Button>
        </div>

        {simulateError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Simulation Error:</h4>
            <p className="text-red-400 text-sm">{simulateError.message}</p>
            
            {/* Check for specific error patterns */}
            {simulateError.message.includes('0x90bfb865') && (
              <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-500/20 rounded">
                <p className="text-yellow-400 text-xs">
                  Error 0x90bfb865 suggests a parameter validation issue. 
                  Common causes: invalid currency for chain, incorrect metadata URI format, or missing permissions.
                </p>
              </div>
            )}
            
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer">Full Error Details</summary>
              <pre className="text-xs text-gray-400 mt-1 overflow-auto max-h-32">
                {JSON.stringify(simulateError, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {writeError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Write Error:</h4>
            <p className="text-red-400 text-sm">{writeError.message}</p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
          <h4 className="font-semibold text-blue-400 mb-2">Debug Status:</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>Connected: {isConnected ? '✅' : '❌'}</p>
            <p>Contract Config Ready: {contractCallConfig ? '✅' : '❌'}</p>
            <p>Simulation Ready: {writeConfig ? '✅' : '❌'}</p>
            <p>Is Simulating: {isSimulating ? '⏳' : '✅'}</p>
            <p>Write Pending: {isPending ? '⏳' : '✅'}</p>
            <p>Chain ID: {chainId}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};