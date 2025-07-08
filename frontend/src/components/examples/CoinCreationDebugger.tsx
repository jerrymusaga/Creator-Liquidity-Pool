'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount } from 'wagmi';
import { createCoinCall, DeployCurrency, InitialPurchaseCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { Address, parseEther } from 'viem';
import { base } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Debugger to test different parameter combinations and find the ABI mismatch
 */
export const CoinCreationDebugger: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const [testResults, setTestResults] = useState<Array<{name: string, success: boolean, error?: string, args?: readonly unknown[]}>>([]);

  const currentChainId = chain?.id || base.id;
  const isBaseMainnet = currentChainId === base.id;

  const testConfigurations = [
    {
      name: "Minimal (name, symbol, uri, payoutRecipient)",
      params: () => ({
        name: "Test Coin 1",
        symbol: "TC1",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
      })
    },
    {
      name: "With chainId",
      params: () => ({
        name: "Test Coin 2",
        symbol: "TC2", 
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: currentChainId,
      })
    },
    {
      name: "With currency (ETH)",
      params: () => ({
        name: "Test Coin 3",
        symbol: "TC3",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: currentChainId,
        currency: DeployCurrency.ETH,
      })
    },
    {
      name: "With currency (ZORA) - Base only",
      params: () => ({
        name: "Test Coin 4", 
        symbol: "TC4",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: base.id, // Force Base mainnet
        currency: DeployCurrency.ZORA,
      })
    },
    {
      name: "With platformReferrer",
      params: () => ({
        name: "Test Coin 5",
        symbol: "TC5",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: currentChainId,
        currency: DeployCurrency.ETH,
        platformReferrer: "0x742d35Cc6635C0532925a3b8C17F2E1bC5C1DaE0" as Address,
      })
    },
    {
      name: "With initialPurchase (Base mainnet only)",
      params: () => ({
        name: "Test Coin 6",
        symbol: "TC6",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: base.id, // Force Base mainnet
        currency: DeployCurrency.ZORA,
        initialPurchase: {
          currency: InitialPurchaseCurrency.ETH,
          amount: parseEther("0.001"),
        }
      })
    },
    {
      name: "Full parameters",
      params: () => ({
        name: "Test Coin 7",
        symbol: "TC7",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address as Address,
        chainId: base.id, // Force Base mainnet  
        currency: DeployCurrency.ZORA,
        platformReferrer: "0x742d35Cc6635C0532925a3b8C17F2E1bC5C1DaE0" as Address,
        initialPurchase: {
          currency: InitialPurchaseCurrency.ETH,
          amount: parseEther("0.001"),
        }
      })
    }
  ];

  const runTest = async (config: typeof testConfigurations[0]) => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }

    try {
      const params = config.params();
      console.log(`🧪 Testing: ${config.name}`);
      console.log('📋 Params:', params);
      
      const result = await createCoinCall(params);
      
      console.log(`✅ ${config.name} - SUCCESS`);
      console.log('📋 Result:', result);
      console.log('📋 Args:', result.args);
      console.log('📋 Args length:', result.args?.length);
      
      setTestResults(prev => [...prev, {
        name: config.name,
        success: true,
        args: result.args
      }]);
      
    } catch (error: unknown) {
      console.error(`❌ ${config.name} - FAILED:`, error);
      
      setTestResults(prev => [...prev, {
        name: config.name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }]);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    toast.loading('Running all tests...', { id: 'tests' });
    
    for (const config of testConfigurations) {
      await runTest(config);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    toast.success('All tests completed!', { id: 'tests' });
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">ABI Parameter Debugger</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to run tests.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🔍 ABI Parameter Debugger</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">Debug Info</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Connected Address:</span> {address}</p>
            <p><span className="text-gray-400">Current Chain:</span> {currentChainId} ({isBaseMainnet ? 'Base Mainnet' : 'Base Sepolia'})</p>
            <p><span className="text-gray-400">Purpose:</span> Test different parameter combinations to find ABI mismatch source</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runAllTests} className="flex-1">
            🧪 Run All Tests
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 border ${
                  result.success
                    ? 'bg-green-900/20 border-green-500/20'
                    : 'bg-red-900/20 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">
                    {result.success ? '✅' : '❌'} {result.name}
                  </span>
                  {result.args && (
                    <span className="text-xs text-gray-400">
                      Args: {result.args.length}
                    </span>
                  )}
                </div>
                {result.error && (
                  <p className="text-sm text-red-400">{result.error}</p>
                )}
                {result.args && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">View Args</summary>
                    <pre className="text-xs text-gray-300 mt-1 overflow-auto">
                      {JSON.stringify(result.args, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Individual Tests:</h3>
          <div className="grid grid-cols-1 gap-2">
            {testConfigurations.map((config, index) => (
              <Button
                key={index}
                onClick={() => runTest(config)}
                variant="outline"
                size="sm"
                className="text-left justify-start"
              >
                {config.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};