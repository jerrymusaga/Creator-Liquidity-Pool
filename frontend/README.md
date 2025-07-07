# **VibeStream** - Decentralized Creator Economy Platform

> *Where creativity meets crypto - Build, trade, and earn with Creator Coins on Base*

## **Problem Statement**

### **The Creator Economy Crisis**

The current creator economy is fundamentally broken, with several critical issues affecting both creators and their communities

**For Creators:**
- **Platform Dependency**: Creators rely on centralized platforms (YouTube, TikTok, Instagram) that can change algorithms, demonetize content, or ban accounts without warning
- **High Platform Fees**: Traditional platforms take 30-50% of creator earnings through various fees and revenue sharing models
- **Limited Monetization**: Most creators struggle with inconsistent income streams and lack direct financial relationships with their audience
- **No Ownership**: Creators don't own their audience data, content distribution, or revenue streams

**For Fans/Supporters:**
- **No Investment Upside**: Fans support creators but don't financially benefit from their success
- **Limited Engagement**: Traditional platforms offer minimal ways for fans to meaningfully participate in creator economies
- **Complex Crypto Barriers**: Existing Web3 creator platforms have steep learning curves and poor user experiences
- **Fragmented Experiences**: Trading, social interaction, and content consumption happen across different platforms

**For the Ecosystem:**
- **Centralized Control**: A few major platforms control the entire creator economy, stifling innovation
- **Poor Discovery**: Talented creators struggle to gain visibility in algorithm-driven systems
- **Limited Composability**: Creator economies exist in silos without interoperability

## **Our Solution**

### **Vibestream: The Decentralized Creator Economy**

Vibestream solves these problems by creating a decentralized, social-first platform where creators can launch their own economies and fans can directly invest in creator success.

**Core Solution Pillars:**

### **1. Creator Ownership & Direct Monetization**
```typescript
// Creators deploy their own ERC-20 tokens with one click
const creatorCoin = await createCoin({
  name: "Artist Economy Token",
  symbol: "ART",
  payoutRecipient: creatorAddress, // Creator owns 100% of fees
  currency: DeployCurrency.ETH
})
```
- **Zero Platform Fees**: Creators keep 100% of their direct sales and 50% of all trading fees
- **Full Ownership**: Creator Coins are ERC-20 tokens owned entirely by creators
- **Automatic Rewards**: Zora V4 protocol automatically distributes trading fees - no manual claiming

### **2. Fan Investment & Shared Success**
```typescript
// Fans buy Creator Coins and benefit from creator success
const portfolioGrowth = fanHoldings.map(holding => ({
  creator: holding.coin.creator,
  investment: holding.balance * holding.averagePrice,
  currentValue: holding.balance * holding.currentPrice,
  profit: holding.unrealizedPnL
}))
```
- **Financial Alignment**: Fans profit when their favorite creators succeed
- **Portfolio Building**: Users can build diversified creator portfolios
- **Social Trading**: Trade directly within social feeds via Farcaster frames

### **3. Seamless Social Experience**
```typescript
// Trade Creator Coins directly in social feeds
const frameMetadata = generateTradingFrame(coinAddress, {
  buttons: [
    { label: "Buy 0.01 ETH", action: "tx" },
    { label: "Sell 25%", action: "tx" },
    { label: "View Profile", action: "link" }
  ]
})
```
- **Native Social Trading**: Buy/sell Creator Coins without leaving Farcaster
- **Discovery Engine**: Find new creators through social recommendations
- **Community Features**: Comment, follow, and engage with creator communities

### **4. Decentralized Infrastructure**
- **IPFS Storage**: All metadata stored on decentralized networks
- **Base L2**: Fast, cheap transactions on Ethereum L2
- **Non-Custodial**: Users maintain full control of their assets
- **Composable**: Creator Coins work across the entire DeFi ecosystem

## **Technical Implementation**

### **Smart Contract Architecture**
```typescript
// Zora V4 integration for automatic fee distribution
const coinParams: CreateCoinArgs = {
  name: "Creator Token",
  symbol: "CREATE",
  uri: "ipfs://metadata-hash",
  payoutRecipient: creatorAddress, // 50% of fees
  platformReferrer: vibestreamAddress, // 15% platform fee
  currency: DeployCurrency.ETH
}
```

### **Social Integration**
```typescript
// Farcaster frames for in-feed trading
export async function POST(request: NextRequest) {
  const frameMessage = parseFrameMessage(await request.json())
  
  // Execute trades directly from social feeds
  switch (frameMessage.buttonIndex) {
    case 1: return executeBuyOrder(coinAddress, amount)
    case 2: return executeSellOrder(coinAddress, percentage)
  }
}
```

## **Market Impact**

### **Value Proposition**

**For Creators:**
- **Higher Revenue**: Keep 50% of trading fees vs 0% on traditional platforms
- **Ownership**: Own their economy and audience relationships
- **Growth Incentive**: Fans financially incentivized to promote creator success
- **Diversified Income**: Multiple revenue streams beyond content views

**For Fans:**
- **Investment Opportunity**: Earn alongside favorite creators
- **Enhanced Engagement**: Direct financial stake in creator success  
- **Social Trading**: Discover and trade through social recommendations
- **Portfolio Growth**: Build diversified creator portfolios

**For the Ecosystem:**
- **Decentralization**: Reduced platform risk and increased creator sovereignty
- **Innovation**: Composable creator economies enable new business models
- **Fair Distribution**: Automatic, transparent fee distribution via smart contracts

### **Competitive Advantages**

1. **Social-First Trading**: Only platform enabling native social media trading
2. **Zero Gas Frames**: Trade without leaving social feeds or paying gas
3. **Automatic Rewards**: Set-and-forget fee distribution via Zora V4
4. **Mobile Optimized**: Designed for mobile-first creator audiences
5. **Creator-Owned**: Creators maintain full ownership of their economies

## **Key Features**

**Creator Coin Factory** - Launch your own ERC-20 tokens with automatic V4 rewards
**Real-time Trading** - Buy/sell Creator Coins with seamless Zora integration  
**Farcaster Frames** - Trade directly within social feeds via interactive frames
**Auto Rewards** - Earn 50% of trading fees automatically through Zora V4
**Portfolio Dashboard** - Track holdings, P&L, and transaction history
**Social Features** - Follow, comment, and discover creators
**IPFS Metadata** - Decentralized storage for coin metadata and images

## **Architecture**

### **Tech Stack**

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Blockchain** | Base L2, Zora V4 Protocol |
| **Wallet** | Wagmi, Viem, RainbowKit |
| **State** | Zustand, TanStack Query |
| **Storage** | IPFS (Pinata), Metadata Standards |
| **Social** | Farcaster Frames Integration |

### **Smart Contract Integration**

```typescript
// Zora V4 Creator Coin Creation
const coinParams: CreateCoinArgs = {
  name: "Creator Coin",
  symbol: "COIN", 
  uri: "ipfs://metadata-hash",
  payoutRecipient: creatorAddress,
  currency: DeployCurrency.ETH,
  chainId: 8453 // Base Mainnet
}

const result = await createCoin(coinParams, walletClient, publicClient)
```

## **Getting Started**

### **Prerequisites**

- Node.js 18+ and npm/yarn
- Web3 wallet (MetaMask, Coinbase Wallet, etc.)
- ETH on Base network for gas fees

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-repo/vibestream
cd vibestream/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### **Environment Configuration**

```bash
# .env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ZORA_API_KEY=your_zora_api_key
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

### **Development**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## **Core Features**

### **1. Creator Coin Creation**

```typescript
// Create a new Creator Coin with IPFS metadata
const { createCoinWithMetadata } = useFullCoinCreation()

await createCoinWithMetadata({
  coinData: {
    name: "Artist Token",
    symbol: "ART",
    payoutRecipient: address,
    currency: DeployCurrency.ETH
  },
  metadata: {
    name: "Artist Token",
    description: "Supporting digital art creation",
    image: ipfsImageUri,
    attributes: [
      { trait_type: "Category", value: "Art" },
      { trait_type: "Creator", value: address }
    ]
  }
})
```

### **2. Farcaster Frames Trading**

Interactive frames allow users to trade Creator Coins directly within Farcaster feeds:

```typescript
// Generate trading frame metadata
const frameMetadata = frameGenerator.generateTradingFrame(coinAddress, coinData)

// Handle frame interactions
export async function POST(request: NextRequest) {
  const frameMessage = frameUtils.parseFrameMessage(await request.json())
  
  switch (frameMessage.buttonIndex) {
    case 1: return handleBuyAction(coinAddress, frameMessage.inputText)
    case 2: return handleSellAction(coinAddress, frameMessage.inputText)
  }
}
```

### **3. Portfolio Management**

```typescript
// Track user holdings and portfolio value
const { holdings, transactions, createdCoins } = useUserProfile(address)
const portfolioValue = holdings.reduce((total, holding) => 
  total + (holding.balance * holding.currentPrice), 0
)
```

### **4. V4 Auto Rewards**

Automatic reward distribution through Zora V4:
- **Creators earn 50%** of all trading fees in ZORA tokens
- **Platform earns 15%** referral fees
- **No claiming required** - rewards sent automatically

## **User Experience**

### **Creator Journey**

1. **Connect Wallet** - RainbowKit integration with Base network
2. **Create Profile** - Add bio, social links, and avatar
3. **Launch Coin** - Deploy ERC-20 with IPFS metadata
4. **Share & Promote** - Generate Farcaster frames for social distribution
5. **Earn Rewards** - Automatic fee distribution via V4

### **Fan/Investor Journey**

1. **Discover Creators** - Browse trending, new, and top-gaining coins
2. **Research & Follow** - View creator profiles and coin metrics
3. **Trade Coins** - Buy/sell through intuitive interface or frames
4. **Build Portfolio** - Track holdings and performance
5. **Engage Socially** - Comment, like, and share

### **Navigation Structure**

```
Bottom Navigation:
├── Discover - Personalized feed with creator spotlights
├── Culture - Trending coins and top performers  
├── Create - Launch new Creator Coins
├── Wallet - Portfolio and transaction history
└── Profile - User settings and created coins
```

## **API Routes**

### **Core Endpoints**

| Route | Method | Description |
|-------|--------|-------------|
| `/api/frames/coin/[address]` | GET/POST | Farcaster frame generation and interaction |
| `/api/frames/trade` | POST | Execute trades through frames |
| `/api/upload-metadata` | POST | Upload metadata to IPFS |
| `/api/zora/coins` | GET | Proxy for Zora coin data |

### **Frame Integration**

```typescript
// Frame metadata generation
const frameMetadata = {
  title: `${coin.symbol} - ${priceDisplay}`,
  image: `/api/frames/coin/${address}/image`,
  buttons: [
    { label: "Buy", action: "post" },
    { label: "Sell", action: "post" },
    { label: "Details", action: "link" }
  ]
}
```

## **Security & Best Practices**

### **Smart Contract Security**
- Zora V4 audited protocol integration
- Non-custodial architecture
- Slippage protection on trades

### **Frontend Security**
- Input validation and sanitization
- IPFS content verification
- Wallet signature validation

### **Privacy**
- No localStorage for sensitive data
- React state management only
- Optional balance visibility toggle

## **Network Support**

### **Base Ecosystem**

| Network | Chain ID | Currency | Explorer |
|---------|----------|----------|----------|
| **Base Mainnet** | 8453 | ETH/ZORA | [BaseScan](https://basescan.org) |
| **Base Sepolia** | 84532 | ETH | [Sepolia BaseScan](https://sepolia.basescan.org) |

### **Network Configuration**

```typescript
export const NETWORK_CONFIG = {
  [base.id]: {
    chain: base,
    name: "Base Mainnet",
    rpcUrl: "https://mainnet.base.org",
    zoraFactory: "0x777777751622c0d3258f214F9DF38E35BF45baF3"
  }
}
```

## **Component Architecture**

### **Page Components**
```
src/app/
├── page.tsx                 # Main dashboard with tabbed navigation
├── create/page.tsx          # Creator Coin creation flow
├── profile/page.tsx         # User profile and portfolio
├── wallet/page.tsx          # Wallet and transaction history
└── frame-demo/page.tsx      # Farcaster frame demonstration
```

### **Feature Components**
```
src/components/
├── creator/                 # Coin creation workflows
├── frames/                  # Farcaster frame components
├── home/                    # Dashboard and discovery feeds
├── wallet/                  # Portfolio and transaction management
├── social/                  # Comments, follows, interactions
└── ui/                      # Reusable UI primitives
```

### **Hooks & State**
```
src/hooks/
├── useWallet.ts            # Wallet connection and network management
├── useZoraSDK.tsx          # Zora protocol integration
├── useZoraCoins.ts         # Coin data fetching
└── useZoraProfile.ts       # User profile and holdings
```

## **Roadmap**

### **Phase 1: MVP (Complete)**
- Creator Coin creation with Zora V4
- Basic trading interface
- Farcaster frame integration
- Portfolio management
- IPFS metadata storage

### **Phase 2: Social (In Progress)**
- Enhanced social features (comments, likes)
- Creator discovery algorithms
- Community governance tokens
- Mobile app (React Native)

### **Phase 3: DeFi (Planned)**
- Liquidity pool creation
- Yield farming for coin holders
- Cross-chain bridge support
- NFT minting for top creators

## **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**

```bash
# Fork and clone the repo
git clone https://github.com/your-username/vibestream
cd vibestream/frontend

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and commit
git commit -m "Add amazing feature"

# Push and create a PR
git push origin feature/amazing-feature
```

### **Code Style**

- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits for messages
- Component-driven development

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## **Support**

- **Documentation**: [docs.vibestream.xyz](https://docs.vibestream.xyz)
- **Discord**: [Join our community](https://discord.gg/vibestream)
- **Twitter**: [@vibestream_xyz](https://twitter.com/vibestream_xyz)
- **Email**: support@vibestream.xyz

## **Acknowledgments**

- **Zora Protocol** - For the amazing V4 Creator Coins infrastructure
- **Base** - For providing fast, low-cost L2 transactions
- **Farcaster** - For enabling social crypto experiences
- **Rainbow/Wagmi** - For excellent Web3 developer tools

---

<div align="center">

**Built with care by the Vibestream team**

[Website](https://vibestream.xyz) • [Twitter](https://twitter.com/vibestream_xyz) • [Discord](https://discord.gg/vibestream)

</div>