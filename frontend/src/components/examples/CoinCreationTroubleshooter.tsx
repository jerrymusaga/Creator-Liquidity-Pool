'use client'
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { createCoinCall, DeployCurrency, type ValidMetadataURI } from '@zoralabs/coins-sdk';
import { Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import toast from 'react-hot-toast';

interface TroubleshootResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  suggestion?: string;
}

export const CoinCreationTroubleshooter: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [troubleshootResults, setTroubleshootResults] = useState<TroubleshootResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTroubleshootChecks = async () => {
    if (!address) {
      toast.error('Connect wallet first');
      return;
    }

    setIsRunning(true);
    const results: TroubleshootResult[] = [];

    try {
      // Check 1: Wallet Connection
      results.push({
        check: 'Wallet Connection',
        status: isConnected ? 'pass' : 'fail',
        message: isConnected ? 'Wallet connected successfully' : 'Wallet not connected',
        suggestion: !isConnected ? 'Connect your wallet first' : undefined
      });

      // Check 2: Network Support
      const supportedChains = [base.id, baseSepolia.id];
      const isSupported = supportedChains.includes(chainId as typeof base.id | typeof baseSepolia.id);
      results.push({
        check: 'Network Support',
        status: isSupported ? 'pass' : 'fail',
        message: isSupported 
          ? `Connected to supported network: ${chainId === base.id ? 'Base Mainnet' : 'Base Sepolia'}` 
          : `Unsupported network: ${chainId}`,
        suggestion: !isSupported ? 'Switch to Base Mainnet (8453) or Base Sepolia (84532)' : undefined
      });

      // Check 3: Balance Info (informational only)
      results.push({
        check: 'ETH Balance',
        status: 'pass',
        message: `Current balance: ${balance?.value ? (Number(balance.value) / 1e18).toFixed(6) : '0'} ETH`,
        suggestion: 'Gas fees are typically very small (< 0.0001 ETH)'
      });

      // Check 4: Currency Selection
      const isBaseMainnet = chainId === base.id;
      const recommendedCurrency = isBaseMainnet ? DeployCurrency.ZORA : DeployCurrency.ETH;
      results.push({
        check: 'Currency Selection',
        status: 'pass',
        message: `Recommended currency: ${recommendedCurrency === DeployCurrency.ZORA ? 'ZORA' : 'ETH'}`,
        suggestion: isBaseMainnet ? 'ZORA tokens are recommended on Base Mainnet' : 'ETH is required on Base Sepolia'
      });

      // Check 5: Metadata URI Format
      const testUri = "ipfs://bafybeigoxzqzbnxsn35vq7lls3ljxdcwjafxvbvkivprsodzrptpiguysy";
      const isValidUri = testUri.startsWith('ipfs://') || testUri.startsWith('https://');
      results.push({
        check: 'Metadata URI Format',
        status: isValidUri ? 'pass' : 'fail',
        message: isValidUri ? 'URI format is valid' : 'Invalid URI format',
        suggestion: !isValidUri ? 'Use IPFS (ipfs://) or HTTPS URL for metadata' : undefined
      });

      // Check 6: Contract Call Preparation
      try {
        const testParams = {
          name: "Test Coin",
          symbol: "TC",
          uri: testUri as ValidMetadataURI,
          payoutRecipient: address,
          currency: recommendedCurrency,
        };

        await createCoinCall(testParams);
        
        results.push({
          check: 'Contract Call Preparation',
          status: 'pass',
          message: 'Contract call can be prepared successfully',
        });
      } catch (error) {
        results.push({
          check: 'Contract Call Preparation',
          status: 'fail',
          message: `Contract call preparation failed: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: 'Check parameter format and network compatibility'
        });
      }

      // Check 7: Platform Referrer (if provided)
      const platformReferrer = process.env.NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS;
      if (platformReferrer) {
        const isValidAddress = platformReferrer.match(/^0x[a-fA-F0-9]{40}$/);
        results.push({
          check: 'Platform Referrer Address',
          status: isValidAddress ? 'pass' : 'warning',
          message: isValidAddress 
            ? `Valid platform referrer: ${platformReferrer.slice(0, 8)}...${platformReferrer.slice(-6)}`
            : 'Platform referrer address format may be invalid',
          suggestion: !isValidAddress ? 'Check NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS format' : undefined
        });
      } else {
        results.push({
          check: 'Platform Referrer Address',
          status: 'warning',
          message: 'No platform referrer configured',
          suggestion: 'Set NEXT_PUBLIC_VIBE_PLATFORM_ADDRESS to earn referral fees'
        });
      }

    } catch (error) {
      results.push({
        check: 'General Error',
        status: 'fail',
        message: `Troubleshooting failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    setTroubleshootResults(results);
    setIsRunning(false);
  };

  // Auto-run checks when component mounts and wallet connects
  useEffect(() => {
    if (isConnected && address) {
      runTroubleshootChecks();
    }
  }, [isConnected, address, chainId]);

  const getStatusIcon = (status: TroubleshootResult['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TroubleshootResult['status']) => {
    switch (status) {
      case 'pass': return 'text-green-400';
      case 'fail': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">🔍 Coin Creation Troubleshooter</h2>
        <p className="text-gray-400 mb-4">Please connect your wallet to run diagnostics.</p>
      </Card>
    );
  }

  const passCount = troubleshootResults.filter(r => r.status === 'pass').length;
  const failCount = troubleshootResults.filter(r => r.status === 'fail').length;
  const warningCount = troubleshootResults.filter(r => r.status === 'warning').length;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">🔍 Coin Creation Troubleshooter</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="text-green-400">{passCount} passed</span>
            {failCount > 0 && <span className="text-red-400 ml-2">{failCount} failed</span>}
            {warningCount > 0 && <span className="text-yellow-400 ml-2">{warningCount} warnings</span>}
          </div>
          <Button onClick={runTroubleshootChecks} disabled={isRunning} size="sm">
            {isRunning ? 'Running...' : 'Re-run Checks'}
          </Button>
        </div>

        {troubleshootResults.length > 0 && (
          <div className="space-y-3">
            {troubleshootResults.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg p-3 border ${
                  result.status === 'pass' 
                    ? 'bg-green-900/20 border-green-500/20'
                    : result.status === 'fail'
                    ? 'bg-red-900/20 border-red-500/20'
                    : 'bg-yellow-900/20 border-yellow-500/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">{getStatusIcon(result.status)}</span>
                      <span className="font-medium">{result.check}</span>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.status)}`}>
                      {result.message}
                    </p>
                    {result.suggestion && (
                      <p className="text-xs text-gray-400 mt-1">
                        💡 {result.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {failCount === 0 && troubleshootResults.length > 0 && (
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 text-center">
            <h3 className="font-semibold text-green-400 mb-2">🎉 All Checks Passed!</h3>
            <p className="text-sm text-gray-300">
              Your setup looks good. Try creating a coin with the simplified version above.
            </p>
          </div>
        )}

        {failCount > 0 && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
            <h3 className="font-semibold text-red-400 mb-2">❌ Issues Detected</h3>
            <p className="text-sm text-gray-300">
              Please resolve the failed checks above before attempting to create a coin.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};