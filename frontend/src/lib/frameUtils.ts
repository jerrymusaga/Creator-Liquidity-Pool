// Updated frameUtils.ts with proper transaction button handling

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
   * Generate HTML for frame metadata
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

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${this.escapeHtml(metadata.title)}</title>
  
  ${ogTags}
  
  ${frameTags}
</head>
<body>
  <h1>${this.escapeHtml(metadata.title)}</h1>
  <p>${this.escapeHtml(metadata.description)}</p>
  <img src="${metadata.image}" alt="${this.escapeHtml(metadata.title)}" style="max-width: 100%; height: auto;" />
  
  <div style="margin-top: 20px;">
    <p>This is a Farcaster Frame. Interact with it in a Farcaster client to see the buttons and functionality.</p>
    <p>Frame URL: <code>${metadata.postUrl}</code></p>
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
  }
}

// Export singleton instance
export const frameGenerator = new FrameGenerator()