'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useChainId } from 'wagmi';
import { createCoinCall, DeployCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';

/**
 * Ultra minimal version to test basic coin creation
 */
export const CoinCreationMinimal: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [testResults, setTestResults] = useState<Array<{test: string, success: boolean, error?: string}>>([]);

  const runMinimalTests = async () => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }

    setTestResults([]);
    const results: Array<{test: string, success: boolean, error?: string}> = [];

    // Test 1: Absolute minimal parameters (ETH only)
    try {
      const minimalParams = {
        name: "Test",
        symbol: "T", 
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
      };

      console.log('🧪 Test 1: Minimal params (no currency, no chainId)');
      console.log('Params:', minimalParams);
      
      const result1 = await createCoinCall(minimalParams);
      console.log('✅ Test 1 SUCCESS:', result1);
      
      results.push({ test: 'Minimal (4 params)', success: true });
    } catch (error) {
      console.error('❌ Test 1 FAILED:', error);
      results.push({ 
        test: 'Minimal (4 params)', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 2: Add ETH currency explicitly
    try {
      const ethParams = {
        name: "Test ETH",
        symbol: "TE",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
      };

      console.log('🧪 Test 2: With ETH currency');
      console.log('Params:', ethParams);
      
      const result2 = await createCoinCall(ethParams);
      console.log('✅ Test 2 SUCCESS:', result2);
      
      results.push({ test: 'With ETH currency', success: true });
    } catch (error) {
      console.error('❌ Test 2 FAILED:', error);
      results.push({ 
        test: 'With ETH currency', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 3: Add chainId
    try {
      const chainParams = {
        name: "Test Chain",
        symbol: "TC",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
        chainId: chainId,
      };

      console.log('🧪 Test 3: With chainId');
      console.log('Params:', chainParams);
      
      const result3 = await createCoinCall(chainParams);
      console.log('✅ Test 3 SUCCESS:', result3);
      
      results.push({ test: 'With chainId', success: true });
    } catch (error) {
      console.error('❌ Test 3 FAILED:', error);
      results.push({ 
        test: 'With chainId', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 4: Try ZORA currency (Base mainnet only)
    if (chainId === base.id) {
      try {
        const zoraParams = {
          name: "Test ZORA",
          symbol: "TZ",
          uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
          payoutRecipient: address,
          currency: DeployCurrency.ZORA,
          chainId: base.id,
        };

        console.log('🧪 Test 4: With ZORA currency (Base mainnet)');
        console.log('Params:', zoraParams);
        
        const result4 = await createCoinCall(zoraParams);
        console.log('✅ Test 4 SUCCESS:', result4);
        
        results.push({ test: 'With ZORA currency', success: true });
      } catch (error) {
        console.error('❌ Test 4 FAILED:', error);
        results.push({ 
          test: 'With ZORA currency', 
          success: false, 
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Test 5: Try proper data URI with image field
    try {
      // Create proper metadata with image field
      const metadata = {
        name: "Test Data URI",
        description: "Test coin with data URI",
        image: "https://via.placeholder.com/400x400.png?text=Test"
      };
      const metadataBase64 = btoa(JSON.stringify(metadata));
      
      const dataUriParams = {
        name: "Test Data URI",
        symbol: "TDU",
        uri: `data:application/json;base64,${metadataBase64}` as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
      };

      console.log('🧪 Test 5: With proper data URI (includes image)');
      console.log('Params:', dataUriParams);
      console.log('Metadata:', metadata);
      
      const result5 = await createCoinCall(dataUriParams);
      console.log('✅ Test 5 SUCCESS:', result5);
      
      results.push({ test: 'With data URI (proper metadata)', success: true });
    } catch (error) {
      console.error('❌ Test 5 FAILED:', error);
      results.push({ 
        test: 'With data URI (proper metadata)', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Test 6: Check if the IPFS URI has proper metadata
    try {
      console.log('🧪 Test 6: Checking IPFS metadata validity');
      const ipfsUrl = "https://ipfs.io/ipfs/bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy";
      
      // This is just to test the URI format, not actually fetch
      const ipfsParams = {
        name: "Test IPFS Check",
        symbol: "TIC",
        uri: "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy" as ValidMetadataURI,
        payoutRecipient: address,
        currency: DeployCurrency.ETH,
      };

      console.log('IPFS URL to check:', ipfsUrl);
      console.log('Params:', ipfsParams);
      
      const result6 = await createCoinCall(ipfsParams);
      console.log('✅ Test 6 SUCCESS:', result6);
      
      results.push({ test: 'IPFS metadata validation', success: true });
    } catch (error) {
      console.error('❌ Test 6 FAILED:', error);
      results.push({ 
        test: 'IPFS metadata validation', 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      });
    }

    setTestResults(results);
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (successCount > 0) {
      toast.success(`${successCount}/${totalCount} tests passed!`);
    } else {
      toast.error(`All ${totalCount} tests failed - there may be a fundamental issue`);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🔬 Minimal Test Suite</h2>
        <p className="text-gray-400 mb-4">Connect your wallet to run minimal tests.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🔬 Minimal Test Suite</h2>
      
      <div className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-400 mb-2">Strategy</h3>
          <p className="text-sm text-gray-300">
            Testing progressively complex parameter combinations to find exactly what causes the 0x90bfb865 error.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm space-y-1">
            <p><span className="text-gray-400">Address:</span> {address?.slice(0, 8)}...{address?.slice(-6)}</p>
            <p><span className="text-gray-400">Chain ID:</span> {chainId}</p>
            <p><span className="text-gray-400">Network:</span> {chainId === base.id ? 'Base Mainnet' : chainId === baseSepolia.id ? 'Base Sepolia' : 'Other'}</p>
          </div>
        </div>

        <Button onClick={runMinimalTests} className="w-full">
          🧪 Run Minimal Tests
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
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {result.success ? '✅' : '❌'} {result.test}
                  </span>
                </div>
                {result.error && (
                  <div className="mt-2">
                    <p className="text-sm text-red-400">{result.error}</p>
                    {result.error.includes('0x90bfb865') && (
                      <p className="text-xs text-yellow-400 mt-1">
                        🔍 This is the target error we're trying to solve
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-400 mb-2">Expected Outcome</h3>
          <p className="text-sm text-gray-300">
            If all tests fail with 0x90bfb865, the issue is fundamental (network, permissions, or SDK version).
            If some pass, we'll know which parameters cause the error.
          </p>
        </div>
      </div>
    </Card>
  );
};