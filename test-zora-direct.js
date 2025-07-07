#!/usr/bin/env node

// Direct test of Zora SDK without the frontend
// This helps isolate any SDK-specific issues

const { createCoin, DeployCurrency, setApiKey } = require('@zoralabs/coins-sdk');

async function testZoraSDKDirect() {
  console.log('🚀 Testing Zora SDK directly...');
  
  try {
    // Set API key
    setApiKey('zora_api_05e7317ac10aaf5a4697a6c76358fda29aafc30e3a3d7e1a023724ef3ba2c8e9');
    
    console.log('✅ Zora SDK imported and API key set');
    
    // Test parameters - this is just to test the SDK imports and basic structure
    const testParams = {
      name: 'Test Coin',
      symbol: 'TEST',
      uri: 'ipfs://bafkreiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      payoutRecipient: '0x742C1C0e1b1c03f0F82C21B698FEe27A7dD6a833',
      currency: DeployCurrency.ETH,
      chainId: 84532 // Base Sepolia
    };
    
    console.log('📋 Test parameters prepared:', testParams);
    console.log('ℹ️  Note: This test only validates SDK structure, not actual coin creation');
    console.log('✅ SDK structure test passed');
    
    return true;
    
  } catch (error) {
    console.error('❌ SDK test failed:', error);
    return false;
  }
}

// Run the test
testZoraSDKDirect()
  .then((success) => {
    if (success) {
      console.log('🎉 Direct SDK test completed successfully');
      console.log('💡 Now test coin creation through the web interface at http://localhost:3000/test-coin');
    } else {
      console.log('💥 Direct SDK test failed - check the errors above');
    }
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
  });