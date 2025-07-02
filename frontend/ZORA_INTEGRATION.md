# Zora Integration Guide

This guide explains how the Creator Coin platform integrates with Zora V4 for real Creator Coin functionality.

## Overview

The platform now uses the official Zora SDK to:
- Fetch real Creator Coins from the Zora ecosystem
- Display live market data (prices, volume, holders)
- Enable coin creation through Zora's infrastructure
- Connect to Zora's V4 automatic reward system

## Components Integrated

### 1. Zora SDK Setup (`/src/config/zora.ts`)
- Initializes the Zora SDK with API key
- Configures default pagination and cache settings

### 2. Data Fetching Hooks (`/src/hooks/`)
- `useZoraCoins.ts`: Fetches coins by category (trending, new, top gainers)
- `useZoraProfile.ts`: User profile data and portfolio calculations
- `useZoraCoinCreation.ts`: Coin creation functionality
- `useZoraSDK.ts`: Main SDK interface with trading functions

### 3. Updated Components
- `LiveCoinsFeed`: Now displays real Zora Creator Coins
- `WalletPage`: Shows real portfolio data from user's wallet
- `ProfilePage`: Displays user's actual holdings and created coins

## Environment Setup

Create a `.env.local` file based on `.env.example`:

```bash
# Required for production use
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key_here

# Optional - for custom RPC endpoints
NEXT_PUBLIC_BASE_RPC_URL=your_base_rpc_url
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=your_base_sepolia_rpc_url

# For wallet connections
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Getting a Zora API Key

1. Visit [Zora Developer Portal](https://docs.zora.co)
2. Create an account and navigate to Developer Settings
3. Generate an API key
4. Add it to your environment variables

## Network Configuration

The app is configured to work with:
- **Base Mainnet** (production)
- **Base Sepolia** (testnet)

Current network is set in `/src/config/networks.ts` via `CURRENT_NETWORK` constant.

## Key Features

### Real-time Data
- Live Creator Coin prices and market data
- Volume and holder count tracking
- Top gainers, trending, and new coins

### Wallet Integration
- Connect via Rainbow Kit (MetaMask, Coinbase, WalletConnect)
- Automatic network switching
- Real portfolio calculations

### V4 Rewards
- All coins automatically participate in Zora V4 rewards
- Creators earn 50% of trading fees
- Platform earns 15% referral rewards

### Coin Creation
- Full coin creation flow through Zora contracts
- IPFS metadata upload support
- Automatic contract deployment

## Development

### Running Locally
```bash
npm install
npm run dev
```

### Testing
- Use Base Sepolia testnet for development
- Get testnet ETH from Base faucets
- Test coin creation and trading flows

### Production Deployment
- Set `CURRENT_NETWORK` to Base Mainnet
- Ensure API keys are properly configured
- Test wallet connections on target network

## API Rate Limits

Without an API key, the Zora API has rate limits. For production:
- Always use an API key
- Implement proper caching strategies
- Consider query deduplication

## Troubleshooting

### Common Issues

1. **"No coins found"**
   - Check network connection
   - Verify API key is set
   - Ensure correct network is selected

2. **Wallet connection issues**
   - Check network configuration
   - Verify WalletConnect project ID
   - Ensure user is on correct network

3. **Coin creation fails**
   - Check wallet has sufficient ETH
   - Verify metadata URI is valid
   - Ensure network is supported

## Future Enhancements

- [ ] Individual coin detail pages
- [ ] Trading interface with slippage controls
- [ ] Portfolio analytics dashboard
- [ ] Social features (comments, following)
- [ ] Advanced filtering and search
- [ ] Push notifications for price alerts

## Support

For Zora SDK issues: [Zora Documentation](https://docs.zora.co)
For platform issues: Create an issue in this repository