'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useSimulateContract, useWriteContract } from 'wagmi';
import { createCoinCall, DeployCurrency, InitialPurchaseCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { Address, parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Fixed version that handles the ABI encoding mismatch
 */
export const CoinCreationWagmiFixed: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const [contractCallConfig, setContractCallConfig] = useState<any>(null);
  const [isPreparingContract, setIsPreparingContract] = useState(false);

  // Determine appropriate chain and currency
  const currentChainId = chain?.id || base.id;
  const isBaseMainnet = currentChainId === base.id;
  const currency = isBaseMainnet ? DeployCurrency.ZORA : DeployCurrency.ETH;

  // Platform referrer address - replace with your actual platform address
  const PLATFORM_REFERRER = process.env.NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS as Address || "0x742d35Cc6635C0532925a3b8C17F2E1bC5C1DaE0" as Address; // Example address

  // Coin parameters with all important features
  const createCoinParams = () => {
    if (!address) return null;
    
    const baseParams = {
      name: "Test WAGMI Coin",
      symbol: "TWC",
      uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
      payoutRecipient: address,
      currency,
      chainId: currentChainId,
      platformReferrer: PLATFORM_REFERRER, // This earns referral fees
    };

    // Add initial purchase for Base mainnet only (as per docs)
    if (isBaseMainnet) {
      return {
        ...baseParams,
        initialPurchase: {
          currency: InitialPurchaseCurrency.ETH,
          amount: parseEther("0.001"), // 0.001 ETH initial purchase
          // amountOutMinimum can be added for slippage protection
        }
      };
    }

    return baseParams;
  };

  // Prepare contract call configuration
  const prepareContractCall = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    const coinParams = createCoinParams();
    if (!coinParams) {
      toast.error('Invalid parameters');
      return;
    }

    setIsPreparingContract(true);

    try {
      toast.loading('Preparing contract call...', { id: 'prepare' });
      
      console.log('🔍 Preparing with params:', coinParams);
      console.log('🔍 Chain ID:', currentChainId);
      console.log('🔍 Currency:', currency);
      
      // Create configuration for wagmi using createCoinCall
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('🔍 createCoinCall result:', contractCallParams);
      console.log('🔍 Function name:', contractCallParams.functionName);
      console.log('🔍 Args:', contractCallParams.args);
      console.log('🔍 Args length:', contractCallParams.args?.length);
      
      setContractCallConfig(contractCallParams);
      
      toast.success('Contract call prepared!', { id: 'prepare' });
    } catch (error: any) {
      console.error('❌ Failed to prepare contract call:', error);
      console.error('❌ Error stack:', error.stack);
      toast.error(`Failed to prepare: ${error.message}`, { id: 'prepare' });
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
    ...contractCallConfig,
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
    } catch (error: any) {
      console.error('❌ Write contract error:', error);
      toast.error(`Transaction failed: ${error.message}`);
    }
  };

  // Handle success
  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Coin created successfully! 🎉');
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
        <h2 className="text-xl font-bold mb-4">WAGMI Coin Creation (Fixed)</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to continue.</p>
      </Card>
    );
  }

  const coinParams = createCoinParams();

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">WAGMI Coin Creation (Fixed)</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Coin Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Name:</span> {coinParams?.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {coinParams?.symbol}</p>
            <p><span className="text-gray-400">Currency:</span> {currency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'}</p>
            <p><span className="text-gray-400">Chain:</span> {isBaseMainnet ? 'Base Mainnet' : 'Base Sepolia'}</p>
            <p><span className="text-gray-400">Platform Referrer:</span> {PLATFORM_REFERRER.slice(0, 8)}...{PLATFORM_REFERRER.slice(-6)}</p>
            <p><span className="text-gray-400">Initial Purchase:</span> {isBaseMainnet ? '0.001 ETH' : 'Not supported'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={prepareContractCall}
            disabled={!isConnected || isPreparingContract}
            className="w-full"
          >
            {isPreparingContract ? 'Preparing...' : '1. Prepare Contract Call'}
          </Button>

          <Button 
            onClick={handleCreateCoin}
            disabled={!writeConfig || isPending || !contractCallConfig || isSimulating}
            className="w-full"
          >
            {isPending ? 'Creating...' : isSimulating ? 'Simulating...' : '2. Create Coin'}
          </Button>
        </div>

        {simulateError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <h4 className="font-semibold text-red-400 mb-1">Simulation Error:</h4>
            <p className="text-red-400 text-sm">{simulateError.message}</p>
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
              <pre className="text-xs text-gray-400 mt-1 overflow-auto">
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
          <h4 className="font-semibold text-blue-400 mb-2">Debug Info:</h4>
          <div className="text-xs text-gray-300 space-y-1">
            <p>Contract Config Ready: {contractCallConfig ? '✅' : '❌'}</p>
            <p>Simulation Ready: {writeConfig ? '✅' : '❌'}</p>
            <p>Is Simulating: {isSimulating ? '⏳' : '✅'}</p>
            <p>Write Pending: {isPending ? '⏳' : '✅'}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};