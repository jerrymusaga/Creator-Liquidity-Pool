'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useSimulateContract, useWriteContract } from 'wagmi';
import { createCoinCall, DeployCurrency, type ValidMetadataURI, InitialPurchaseCurrency } from '@zoralabs/coins-sdk';
import { parseEther, Address } from 'viem';
import { base } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Example component showing how to use the WAGMI method for coin creation
 * This is based on the documentation provided by Zora
 */
export const CoinCreationWagmiExample: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [contractCallConfig, setContractCallConfig] = useState<any>(null);

  // Example coin parameters - simplified to avoid ABI mismatch
  const coinParams = {
    name: "My Awesome Coin",
    symbol: "MAC",
    uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
    payoutRecipient: address as Address,
    chainId: base.id,
    currency: DeployCurrency.ETH, // Use ETH to avoid potential ZORA parameter issues
    // Remove optional parameters that might cause ABI mismatch
    // platformReferrer: "0xOptionalPlatformReferrerAddress" as Address,
    // initialPurchase: {
    //   currency: InitialPurchaseCurrency.ETH,
    //   amount: parseEther("0.01"),
    // },
  };

  // Prepare contract call configuration
  const prepareContractCall = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      toast.loading('Preparing contract call...', { id: 'prepare' });
      
      console.log('🔍 Input coinParams:', coinParams);
      
      // Create configuration for wagmi using createCoinCall
      const contractCallParams = await createCoinCall(coinParams);
      
      console.log('🔍 createCoinCall result:', contractCallParams);
      console.log('🔍 ABI args length:', contractCallParams.args?.length);
      console.log('🔍 ABI args:', contractCallParams.args);
      
      setContractCallConfig(contractCallParams);
      
      toast.success('Contract call prepared!', { id: 'prepare' });
    } catch (error: any) {
      console.error('Failed to prepare contract call:', error);
      console.error('Error details:', error);
      toast.error(`Failed to prepare: ${error.message}`, { id: 'prepare' });
    }
  };

  // Simulate contract call
  const { data: writeConfig, error: simulateError } = useSimulateContract({
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
      toast.error(`Simulation failed: ${simulateError.message}`);
      return;
    }

    try {
      writeContract(writeConfig.request);
    } catch (error: any) {
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
      toast.error(`Transaction failed: ${writeError.message}`);
    }
  }, [writeError]);

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">WAGMI Coin Creation Example</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to continue.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">WAGMI Coin Creation Example</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Coin Parameters:</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Name:</span> {coinParams.name}</p>
            <p><span className="text-gray-400">Symbol:</span> {coinParams.symbol}</p>
            <p><span className="text-gray-400">Currency:</span> {coinParams.currency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'}</p>
            <p><span className="text-gray-400">Chain ID:</span> {coinParams.chainId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={prepareContractCall}
            disabled={!isConnected}
            className="w-full"
          >
            1. Prepare Contract Call
          </Button>

          <Button 
            onClick={handleCreateCoin}
            disabled={!writeConfig || isPending || !contractCallConfig}
            className="w-full"
          >
            {isPending ? 'Creating...' : '2. Create Coin'}
          </Button>
        </div>

        {simulateError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">Simulation Error: {simulateError.message}</p>
          </div>
        )}

        {writeError && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">Write Error: {writeError.message}</p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
          <h4 className="font-semibold text-blue-400 mb-2">How this works:</h4>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. <code>createCoinCall()</code> prepares the contract call parameters</li>
            <li>2. <code>useSimulateContract()</code> simulates the transaction</li>
            <li>3. <code>useWriteContract()</code> executes the actual transaction</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};