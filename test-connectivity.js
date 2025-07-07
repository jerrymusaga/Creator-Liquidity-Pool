// Test network connectivity and API endpoints
const https = require('https');
const http = require('http');

async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve(false);
    });
  });
}

async function testConnectivity() {
  console.log('🔗 Testing network connectivity...\n');
  
  const tests = [
    ['https://api.zora.co', 'Zora API'],
    ['https://sepolia.base.org', 'Base Sepolia RPC'],
    ['https://api.pinata.cloud', 'Pinata IPFS'],
    ['http://localhost:3000', 'Local Dev Server'],
    ['https://basescan.org', 'Base Explorer']
  ];
  
  for (const [url, description] of tests) {
    await testEndpoint(url, description);
  }
  
  console.log('\n📋 Environment check:');
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Arch:', process.arch);
}

testConnectivity().catch(console.error);