'use client'
import React from 'react';
import { CoinCreationWagmiExample } from '@/components/examples/CoinCreationWagmiExample';
import { CoinCreationWagmiFixed } from '@/components/examples/CoinCreationWagmiFixed';
import { CoinCreationDebugger } from '@/components/examples/CoinCreationDebugger';
import { CoinCreationSimplified } from '@/components/examples/CoinCreationSimplified';
import { CoinCreationTroubleshooter } from '@/components/examples/CoinCreationTroubleshooter';
import { CoinCreationMinimal } from '@/components/examples/CoinCreationMinimal';

export default function TestWagmiPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">WAGMI Coin Creation Test</h1>
        
        <div className="mb-8">
          <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-green-400 mb-2">✅ Implementation Complete</h2>
            <p className="text-sm text-gray-300">
              Successfully implemented the WAGMI method for coin creation as per Zora documentation.
              This replaces the basic creation method and should resolve the errors you were experiencing.
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
            <h2 className="font-semibold text-blue-400 mb-2">🔄 What Changed</h2>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Created <code>useZoraCoinCreationWagmi.ts</code> hook using WAGMI pattern</li>
              <li>• Updated <code>IPFSCoinCreation.tsx</code> to use new WAGMI hook</li>
              <li>• Uses <code>createCoinCall</code> + <code>useSimulateContract</code> + <code>useWriteContract</code></li>
              <li>• More reliable transaction handling with proper error states</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-red-400">🚨 Contract Revert Error</h3>
            <p className="text-sm text-gray-300 mb-2">
              Error <code>0x90bfb865</code> indicates a contract validation failure. Common causes:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc ml-4">
              <li>Invalid currency for the target chain</li>
              <li>Malformed metadata URI</li>
              <li>Missing contract permissions</li>
              <li>Parameter encoding issues</li>
            </ul>
          </div>

          <CoinCreationMinimal />
          
          <CoinCreationTroubleshooter />
          
          <CoinCreationSimplified />
          
          <CoinCreationDebugger />
          
          <CoinCreationWagmiFixed />
          
          <div className="bg-orange-900/20 border border-orange-500/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-orange-400">🎯 Understanding the Features</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <span className="font-medium text-orange-400">Platform Referrer:</span>
                <p>Address that receives referral fees from all trades of your coin. This is how your platform earns revenue.</p>
              </div>
              <div>
                <span className="font-medium text-orange-400">Initial Purchase:</span>
                <p>Automatically buys coins upon creation to seed liquidity. Only works on Base mainnet with ETH→ZORA conversion.</p>
              </div>
            </div>
          </div>
          
          <details className="bg-gray-800 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Original Example (with ABI error)</summary>
            <div className="mt-4">
              <CoinCreationWagmiExample />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}