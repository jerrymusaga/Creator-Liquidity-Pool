// Test script to create a coin using Zora SDK
// Run this in the browser console after connecting wallet

const testCoinCreation = async () => {
  console.log('🚀 Starting test coin creation...');
  
  // Check if we have wallet connection
  if (!window.ethereum) {
    console.error('❌ No wallet detected');
    return;
  }
  
  // Connect to wallet if not connected
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
    console.log('🔗 Requesting wallet connection...');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }
  
  // Check network
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  console.log('🌐 Current chain ID:', parseInt(chainId, 16));
  
  // Base Sepolia chain ID is 84532
  if (parseInt(chainId, 16) !== 84532) {
    console.log('🔄 Switching to Base Sepolia...');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }] // 84532 in hex
      });
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      return;
    }
  }
  
  // Test coin parameters
  const testCoin = {
    name: 'Test Creator Coin',
    symbol: 'TEST',
    description: 'A test coin created using Zora SDK',
    image: 'https://api.dicebear.com/7.x/identicon/svg?seed=test',
    initialPurchaseWei: BigInt('1000000000000000') // 0.001 ETH
  };
  
  console.log('📋 Test coin parameters:', testCoin);
  
  // Try to access the Zora SDK functions
  try {
    // Import Zora SDK functions
    const { createCoin, setApiKey } = await import('@zoralabs/coins-sdk');
    
    // Set API key if available
    if (process.env.NEXT_PUBLIC_ZORA_API_KEY) {
      setApiKey(process.env.NEXT_PUBLIC_ZORA_API_KEY);
    }
    
    console.log('✅ Zora SDK imported successfully');
    
    // Create the coin
    console.log('⚡ Creating coin...');
    const result = await createCoin(testCoin);
    
    console.log('🎉 Coin created successfully!', result);
    return result;
    
  } catch (error) {
    console.error('❌ Error creating coin:', error);
    
    // Log detailed error information
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    return null;
  }
};

// Instructions for manual testing
console.log(`
🧪 TEST COIN CREATION SCRIPT LOADED

To test coin creation:
1. Make sure you're connected to Base Sepolia testnet
2. Ensure you have some ETH for gas fees
3. Run: testCoinCreation()

This will attempt to create a test coin using the Zora SDK.
`);

// Export for use
window.testCoinCreation = testCoinCreation;