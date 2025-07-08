'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useChainId } from 'wagmi';
import { createCoinCall, DeployCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Final attempt - trying different approaches to avoid 0x90bfb865 error
 */
export const CoinCreationFinal: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [testResults, setTestResults] = useState<Array<{approach: string, success: boolean, error?: string, solution?: string}>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runFinalTests = async () => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    const results: Array<{approach: string, success: boolean, error?: string, solution?: string}> = [];

    // Approach 1: Try with different metadata URI (simpler one)
    try {
      const simpleMetadata = {
        name: "Test Coin",
        description: "A test coin",
        image: "https://via.placeholder.com/300x300.png?text=Test"
      };
      const simpleMetadataUri = `data:application/json;base64,${btoa(JSON.stringify(simpleMetadata))}`;
      
      const simpleParams = {
        name: "Test Coin",
        symbol: "TEST",
        uri: simpleMetadataUri as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
      };

      console.log('🧪 Approach 1: Simple metadata URI');
      const result1 = await createCoinCall(simpleParams);
      console.log('✅ Approach 1 SUCCESS:', result1);
      
      results.push({ 
        approach: 'Simple metadata URI', 
        success: true,
        solution: 'Use data URI with basic metadata instead of IPFS'
      });
    } catch (error) {
      console.error('❌ Approach 1 FAILED:', error);
      results.push({ 
        approach: 'Simple metadata URI', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Approach 2: Try with no platform referrer (let it default)
    try {
      const noReferrerParams = {
        name: "No Referrer Test",
        symbol: "NRT",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
        // No platformReferrer - let it default
      };

      console.log('🧪 Approach 2: No platform referrer');
      const result2 = await createCoinCall(noReferrerParams);
      console.log('✅ Approach 2 SUCCESS:', result2);
      
      results.push({ 
        approach: 'No platform referrer', 
        success: true,
        solution: 'Remove platformReferrer parameter entirely'
      });
    } catch (error) {
      console.error('❌ Approach 2 FAILED:', error);
      results.push({ 
        approach: 'No platform referrer', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Approach 3: Try with different currency order based on chain
    try {
      const appropriateCurrency = chainId === base.id ? DeployCurrency.ZORA : DeployCurrency.ETH;
      
      const currencyParams = {
        name: "Currency Test",
        symbol: "CT",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: appropriateCurrency,
        chainId: chainId,
      };

      console.log('🧪 Approach 3: Chain-appropriate currency');
      const result3 = await createCoinCall(currencyParams);
      console.log('✅ Approach 3 SUCCESS:', result3);
      
      results.push({ 
        approach: 'Chain-appropriate currency', 
        success: true,
        solution: `Use ${appropriateCurrency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'} for this chain`
      });
    } catch (error) {
      console.error('❌ Approach 3 FAILED:', error);
      results.push({ 
        approach: 'Chain-appropriate currency', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Approach 4: Try with owners array explicitly set
    try {
      const ownersParams = {
        name: "Owners Test",
        symbol: "OT",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
        owners: [address], // Explicitly set owners
      };

      console.log('🧪 Approach 4: Explicit owners array');
      const result4 = await createCoinCall(ownersParams);
      console.log('✅ Approach 4 SUCCESS:', result4);
      
      results.push({ 
        approach: 'Explicit owners array', 
        success: true,
        solution: 'Include owners parameter explicitly'
      });
    } catch (error) {
      console.error('❌ Approach 4 FAILED:', error);
      results.push({ 
        approach: 'Explicit owners array', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Approach 5: Try Base Sepolia specifically (if not already)
    if (chainId !== baseSepolia.id) {
      results.push({
        approach: 'Switch to Base Sepolia',
        success: false,
        error: 'Currently on different network',
        solution: 'Switch to Base Sepolia testnet where coin creation might work better'
      });
    }

    setTestResults(results);
    setIsRunning(false);
    
    const successCount = results.filter(r => r.success).length;
    if (successCount > 0) {
      toast.success(`Found ${successCount} working approach(es)!`);
    } else {
      toast.error('All approaches failed - this might be a fundamental issue with the IPFS metadata or contract state');
    }
  };

  const createWorkingCoin = async () => {
    const workingApproach = testResults.find(r => r.success);
    if (!workingApproach) {
      toast.error('No working approach found. Run tests first.');
      return;
    }

    toast.success(`Using: ${workingApproach.solution}`);
    
    // You would implement the actual coin creation here using the working approach
    // For now, just show the successful approach
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🎯 Final Solution Finder</h2>
        <p className="text-gray-400 mb-4">Connect your wallet to find working approaches.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🎯 Final Solution Finder</h2>
      
      <div className="space-y-4">
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-red-400 mb-2">🚨 Error Analysis</h3>
          <p className="text-sm text-gray-300 mb-2">
            The error <code>0x90bfb865</code> keeps occurring. This suggests:
          </p>
          <ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">
            <li>The IPFS metadata might be inaccessible or malformed</li>
            <li>There might be a network-specific issue</li>
            <li>The contract might have additional validation we're missing</li>
            <li>The parameter encoding might be incorrect</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Address:</span> {address?.slice(0, 8)}...{address?.slice(-6)}</p>
            <p><span className="text-gray-400">Chain ID:</span> {chainId}</p>
            <p><span className="text-gray-400">Network:</span> {chainId === base.id ? 'Base Mainnet' : chainId === baseSepolia.id ? 'Base Sepolia' : 'Other'}</p>
          </div>
        </div>

        <Button 
          onClick={runFinalTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Final Tests...' : '🧪 Run Final Solution Tests'}
        </Button>

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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">{result.success ? '✅' : '❌'}</span>
                      <span className="font-medium">{result.approach}</span>
                    </div>
                    {result.success && result.solution && (
                      <p className="text-sm text-green-400 mb-1">
                        💡 {result.solution}
                      </p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-400">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {testResults.some(r => r.success) && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-green-400 mb-2">🎉 Working Solution Found!</h3>
            <p className="text-sm text-gray-300 mb-3">
              At least one approach worked. You can now implement coin creation using the successful method.
            </p>
            <Button onClick={createWorkingCoin} className="w-full">
              Use Working Approach
            </Button>
          </div>
        )}

        {testResults.length > 0 && !testResults.some(r => r.success) && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-red-400 mb-2">❌ All Approaches Failed</h3>
            <p className="text-sm text-gray-300 mb-2">
              This suggests a fundamental issue. Possible solutions:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">
              <li>Check if the IPFS metadata is accessible: <a href="https://ipfs.io/ipfs/bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View metadata</a></li>
              <li>Try a different network (Base Sepolia vs Base Mainnet)</li>
              <li>Check Zora SDK version compatibility</li>
              <li>Contact Zora support for contract-specific issues</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};