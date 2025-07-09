// Updated frameUtils.ts with proper transaction button handling and Farcaster miniapp support

export interface FrameMetadata {
  title: string
  description: string
  image: string
  buttons: FrameButton[]
  input?: string
  postUrl: string
  state?: Record<string, any>
}

export interface FrameButton {
  label: string
  action: 'post' | 'link' | 'tx'
  target?: string
}

function getBaseUrl(): string {
  // Explicit environment variable (recommended)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Farcaster miniapp URL 
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://vibestream-vert.vercel.app'
  }
  
  // Production fallback
  if (typeof window !== 'undefined' && window.location.hostname.includes('vibestream')) {
    return 'https://vibestream-vert.vercel.app'
  }
  
  // Local development
  return 'http://localhost:3000'
}

export class FrameGenerator {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getBaseUrl()
  }

  /**
   * Generate frame metadata for trading a creator coin
   */
  generateTradingFrame(coinAddress: string, coinData: any): FrameMetadata {
    const price = coinData.currentPrice ? parseFloat(coinData.currentPrice) : 0
    const priceDisplay = price > 0 ? `$${price.toFixed(6)}` : 'N/A'

    return {
      title: `${coinData.name} (${coinData.symbol}) - ${priceDisplay}`,
      description: `Trade ${coinData.name} creator coin directly in Farcaster`,
      image: `${this.baseUrl}/api/frames/coin/${coinAddress}/image`,
      postUrl: `${this.baseUrl}/api/frames/coin/${coinAddress}`,
      buttons: [
        { label: `🟢 Buy ${priceDisplay}`, action: 'post' }, // Changed to 'post' for frame navigation
        { label: '🔴 Sell', action: 'post' }, // Changed to 'post' for frame navigation
        { label: '📊 Details', action: 'link', target: `${this.baseUrl}/coin/${coinAddress}` },
        { label: '🔗 Share', action: 'post' }
      ]
    }
  }

  /**
   * Generate frame metadata for buy action with transaction buttons
   */
  generateBuyFrame(coinAddress: string, coinData: any, amount?: string): FrameMetadata {
    const price = coinData.currentPrice ? parseFloat(coinData.currentPrice) : 0
    const amountDisplay = amount ? ` (${amount} ETH)` : ''

    return {
      title: `Buy ${coinData.symbol}${amountDisplay}`,
      description: `Purchase ${coinData.name} with ETH`,
      image: `${this.baseUrl}/api/frames/coin/${coinAddress}/image?action=buy&amount=${amount || '0.01'}`,
      postUrl: `${this.baseUrl}/api/frames/coin/${coinAddress}`,
      input: 'Enter ETH amount (e.g., 0.01)',
      buttons: [
        { 
          label: '🟢 Buy 0.01 ETH', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=buy&amount=0.01`
        },
        { 
          label: '🟢 Buy 0.05 ETH', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=buy&amount=0.05`
        },
        { 
          label: '🟢 Custom Amount', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=buy&custom=true`
        },
        { label: '🔙 Back', action: 'post' }
      ]
    }
  }

  /**
   * Generate frame metadata for sell action with transaction buttons
   */
  generateSellFrame(coinAddress: string, coinData: any): FrameMetadata {
    return {
      title: `Sell ${coinData.symbol}`,
      description: `Sell your ${coinData.name} tokens for ETH`,
      image: `${this.baseUrl}/api/frames/coin/${coinAddress}/image?action=sell`,
      postUrl: `${this.baseUrl}/api/frames/coin/${coinAddress}`,
      input: 'Enter token amount or % to sell',
      buttons: [
        { 
          label: '🔴 Sell 25%', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=sell&percentage=25`
        },
        { 
          label: '🔴 Sell 50%', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=sell&percentage=50`
        },
        { 
          label: '🔴 Sell All', 
          action: 'tx', 
          target: `${this.baseUrl}/api/frames/trade?coinAddress=${coinAddress}&tradeType=sell&percentage=100`
        },
        { label: '🔙 Back', action: 'post' }
      ]
    }
  }

  /**
   * Generate frame metadata for successful trade
   */
  generateTradeSuccessFrame(
    coinAddress: string, 
    coinData: any, 
    tradeType: 'buy' | 'sell',
    amount: string,
    txHash: string
  ): FrameMetadata {
    const action = tradeType === 'buy' ? 'Bought' : 'Sold'
    const symbol = tradeType === 'buy' ? coinData.symbol : 'ETH'

    return {
      title: `✅ ${action} ${coinData.symbol}`,
      description: `Successfully ${tradeType === 'buy' ? 'purchased' : 'sold'} ${amount} ${symbol}`,
      image: `${this.baseUrl}/api/frames/coin/${coinAddress}/image?action=success&type=${tradeType}`,
      postUrl: `${this.baseUrl}/api/frames/coin/${coinAddress}`,
      buttons: [
        { label: '🔗 View TX', action: 'link', target: `https://basescan.org/tx/${txHash}` },
        { label: '📊 Coin Details', action: 'link', target: `${this.baseUrl}/coin/${coinAddress}` },
        { label: '🔄 Trade Again', action: 'post' },
        { label: '🔗 Share', action: 'post' }
      ]
    }
  }

  /**
   * Generate HTML for frame metadata with enhanced styling for Farcaster miniapp
   */
  generateFrameHTML(metadata: FrameMetadata): string {
    const ogTags = `
  <meta property="og:title" content="${this.escapeHtml(metadata.title)}" />
  <meta property="og:description" content="${this.escapeHtml(metadata.description)}" />
  <meta property="og:image" content="${metadata.image}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${this.baseUrl}" />
    `.trim()

    const frameTags = `
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${metadata.image}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:post_url" content="${metadata.postUrl}" />
  ${metadata.input ? `<meta property="fc:frame:input:text" content="${this.escapeHtml(metadata.input)}" />` : ''}
  ${metadata.buttons.map((button, index) => {
    const buttonTags = [
      `<meta property="fc:frame:button:${index + 1}" content="${this.escapeHtml(button.label)}" />`,
      `<meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />`
    ]
    
    if (button.target) {
      buttonTags.push(`<meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />`)
    }
    
    return buttonTags.join('\n  ')
  }).join('\n  ')}
    `.trim()

    // Add CSP headers for Farcaster miniapp compatibility
    const cspMeta = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';">`

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${cspMeta}
  <title>${this.escapeHtml(metadata.title)}</title>
  
  ${ogTags}
  
  ${frameTags}
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .frame-container {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .frame-image {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      margin: 16px 0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    .frame-info {
      margin-top: 16px;
      padding: 16px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.5;
    }
    .frame-url {
      word-break: break-all;
      background: rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 12px;
      margin: 8px 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 16px;
      text-align: left;
    }
    .feature-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 12px;
      border-radius: 8px;
      font-size: 12px;
    }
    .feature-title {
      font-weight: bold;
      margin-bottom: 4px;
      color: #FFD700;
    }
    @media (max-width: 480px) {
      body { padding: 10px; }
      .frame-container { padding: 16px; }
      .features-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="frame-container">
    <h1>${this.escapeHtml(metadata.title)}</h1>
    <p>${this.escapeHtml(metadata.description)}</p>
    <img src="${metadata.image}" alt="${this.escapeHtml(metadata.title)}" class="frame-image" />
    
    <div class="frame-info">
      <p><strong>🎯 This is a Farcaster Frame</strong></p>
      <p>Interact with it in Farcaster or Warpcast to see the trading buttons and functionality.</p>
      
      <div class="frame-url">${metadata.postUrl}</div>
      
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-title">⚡ One-Click Trading</div>
          <div>No app switching required</div>
        </div>
        <div class="feature-item">
          <div class="feature-title">📊 Live Data</div>
          <div>Real-time price updates</div>
        </div>
        <div class="feature-item">
          <div class="feature-title">💰 V4 Rewards</div>
          <div>Automatic creator earnings</div>
        </div>
        <div class="feature-item">
          <div class="feature-title">🔄 Seamless UX</div>
          <div>Context preserved</div>
        </div>
      </div>
      
      <p style="margin-top: 16px; font-size: 12px; opacity: 0.8;">
        🚀 Powered by VibeStream • Trade Creator Coins directly in Farcaster
      </p>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}

/**
 * Utility functions for frame interactions
 */
export const frameUtils = {
  /**
   * Parse frame interaction data from POST request
   */
  parseFrameMessage(body: any) {
    const { untrustedData, trustedData } = body
    
    return {
      fid: untrustedData?.fid,
      buttonIndex: untrustedData?.buttonIndex || 1,
      inputText: untrustedData?.inputText,
      address: untrustedData?.address,
      transactionId: untrustedData?.transactionId,
      castId: untrustedData?.castId,
      state: untrustedData?.state,
      messageBytes: trustedData?.messageBytes
    }
  },

  /**
   * ❌ DEPRECATED: Don't use this for frame responses anymore
   * Farcaster expects HTML, not JSON
   */
  createFrameResponse(frameUrl: string, type: 'frame' | 'message' = 'frame') {
    console.warn('⚠️  createFrameResponse is deprecated. Return HTML frames instead!')
    return {
      type,
      frameUrl
    }
  },

  /**
   * Create transaction response for frame transaction buttons
   */
  createTransactionResponse(
    chainId: string,
    method: string,
    params: {
      to: string
      data: string
      value?: string
      abi?: any[]
    }
  ) {
    return {
      chainId,
      method,
      params
    }
  },

  /**
   * Generate shareable frame URL
   */
  generateShareableFrameUrl(coinAddress: string, baseUrl?: string): string {
    const url = baseUrl || getBaseUrl()
    return `${url}/api/frames/coin/${coinAddress}`
  },

  /**
   * Generate Warpcast share URL
   */
  generateWarpcastShareUrl(frameUrl: string, text?: string): string {
    const encodedUrl = encodeURIComponent(frameUrl)
    const encodedText = text ? encodeURIComponent(text) : ''
    return `https://warpcast.com/~/compose?text=${encodedText}&embeds[]=${encodedUrl}`
  },

  /**
   * Validate frame URL format
   */
  validateFrameUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.pathname.includes('/api/frames/') && parsedUrl.protocol === 'https:'
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const frameGenerator = new FrameGenerator()