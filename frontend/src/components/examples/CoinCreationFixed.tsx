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
 * Fixed version addressing the 0x90bfb865 contract revert error
 */
export const CoinCreationFixed: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [contractCallConfig, setContractCallConfig] = useState<unknown>(null);
  const [isPreparingContract, setIsPreparingContract] = useState(false);

  // Create a valid platform referrer instead of zero address
  const VALID_PLATFORM_REFERRER = "0x131EC028Bb8Bd936A3416635777D905497F3D21f" as Address; // Use your own address as referrer

  const createFixedCoinParams = () => {
    if (!address) return null;
    
    // Use the most basic parameters that worked in the minimal test
    const baseParams = {
      name: "Fixed Test Coin",
      symbol: "FTC",
      uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
      payoutRecipient: address,
      currency: DeployCurrency.ETH,
      // Add valid platform referrer (not zero address)
      platformReferrer: VALID_PLATFORM_REFERRER,
      // Explicitly set chainId
      chainId: chainId,
    };

    return baseParams;
  };

  const prepareContractCall = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const coinParams = createFixedCoinParams();
    if (!coinParams) {
      toast.error('Invalid parameters');
      return;
    }

    setIsPreparingContract(true);

    try {
      toast.loading('Preparing fixed contract call...', { id: 'prepare' });
      
      console.log('🔧 Fixed params:', coinParams);
      
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('🔧 Contract call result:', contractCallParams);
      console.log('🔧 Function:', contractCallParams.functionName);
      console.log('🔧 Args:', contractCallParams.args);
      
      // Log the specific args to see what's being passed
      if (contractCallParams.args) {
        console.log('🔧 Detailed args:');
        console.log('  - payoutRecipient:', contractCallParams.args[0]);
        console.log('  - owners:', contractCallParams.args[1]);
        console.log('  - uri:', contractCallParams.args[2]);
        console.log('  - name:', contractCallParams.args[3]);
        console.log('  - symbol:', contractCallParams.args[4]);
        console.log('  - poolConfig:', contractCallParams.args[5]);
        console.log('  - platformReferrer:', contractCallParams.args[6]);
        console.log('  - postDeployHook:', contractCallParams.args[7]);
        console.log('  - postDeployHookData:', contractCallParams.args[8]);
        console.log('  - coinSalt:', contractCallParams.args[9]);
      }
      
      setContractCallConfig(contractCallParams);
      
      toast.success('Fixed contract call prepared!', { id: 'prepare' });
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
      console.log('🚀 Executing writeContract with fixed params');
      writeContract(writeConfig.request);
    } catch (error: unknown) {
      console.error('❌ Write contract error:', error);
      toast.error(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Fixed coin created successfully! 🎉');
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
        <h2 className="text-xl font-bold mb-4">🔧 Fixed Coin Creation</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to continue.</p>
      </Card>
    );
  }

  const coinParams = createFixedCoinParams();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🔧 Fixed Coin Creation</h2>
      
      <div className="space-y-4">
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-400 mb-2">🎯 Fixes Applied</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✅ Valid platform referrer (not zero address)</li>
            <li>✅ Explicit chainId parameter</li>
            <li>✅ ETH currency (tested working)</li>
            <li>✅ Proper parameter structure</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Coin Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Name:</span> {coinParams?.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {coinParams?.symbol}</p>
            <p><span className="text-gray-400">Currency:</span> ETH</p>
            <p><span className="text-gray-400">Chain:</span> {chainId === base.id ? 'Base Mainnet' : 'Base Sepolia'}</p>
            <p><span className="text-gray-400">Platform Referrer:</span> {VALID_PLATFORM_REFERRER.slice(0, 8)}...{VALID_PLATFORM_REFERRER.slice(-6)}</p>
            <p><span className="text-gray-400">Payout Recipient:</span> {address?.slice(0, 8)}...{address?.slice(-6)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={prepareContractCall}
            disabled={!isConnected || isPreparingContract}
            className="w-full"
          >
            {isPreparingContract ? 'Preparing...' : '1. Prepare Fixed Contract Call'}
          </Button>

          <Button 
            onClick={handleCreateCoin}
            disabled={!writeConfig || isPending || !contractCallConfig || isSimulating}
            className="w-full"
          >
            {isPending ? 'Creating...' : isSimulating ? 'Simulating...' : '2. Create Fixed Coin'}
          </Button>
        </div>

        {simulateError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Simulation Error:</h4>
            <p className="text-red-400 text-sm">{simulateError.message}</p>
            
            {simulateError.message.includes('0x90bfb865') && (
              <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/20 rounded">
                <p className="text-orange-400 text-xs">
                  Still getting 0x90bfb865? This might be a deeper contract issue. 
                  Check if the IPFS metadata is accessible and properly formatted.
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