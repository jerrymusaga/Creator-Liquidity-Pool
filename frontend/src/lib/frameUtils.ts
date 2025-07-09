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
        { label: `🟢 Buy ${priceDisplay}`, action: 'post' },
        { label: '🔴 Sell', action: 'post' },
        { label: '📊 Details', action: 'link', target: `${this.baseUrl}/coin/${coinAddress}` },
        { label: '🔗 Share', action: 'post' }
      ]
    }
  }

  /**
   * Generate frame metadata for buy action
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
        { label: '🟢 Buy 0.01 ETH', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
        { label: '🟢 Buy 0.05 ETH', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
        { label: '🟢 Custom Amount', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
        { label: '🔙 Back', action: 'post' }
      ]
    }
  }

  /**
   * Generate frame metadata for sell action
   */
  generateSellFrame(coinAddress: string, coinData: any): FrameMetadata {
    return {
      title: `Sell ${coinData.symbol}`,
      description: `Sell your ${coinData.name} tokens for ETH`,
      image: `${this.baseUrl}/api/frames/coin/${coinAddress}/image?action=sell`,
      postUrl: `${this.baseUrl}/api/frames/coin/${coinAddress}`,
      input: 'Enter token amount or % to sell',
      buttons: [
        { label: '🔴 Sell 25%', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
        { label: '🔴 Sell 50%', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
        { label: '🔴 Sell All', action: 'tx', target: `${this.baseUrl}/api/frames/trade` },
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
   * Generate frame metadata for coin discovery
   */
  generateDiscoveryFrame(coins: any[]): FrameMetadata {
    return {
      title: 'Discover Creator Coins',
      description: 'Explore trending creator coins on Base',
      image: `${this.baseUrl}/api/frames/discovery/image`,
      postUrl: `${this.baseUrl}/api/frames/discovery`,
      buttons: [
        { label: '🔥 Trending', action: 'post' },
        { label: '📈 Top Gainers', action: 'post' },
        { label: '🆕 New Coins', action: 'post' },
        { label: '💎 High Volume', action: 'post' }
      ]
    }
  }

  /**
   * Generate HTML for frame metadata
   */
  generateFrameHTML(metadata: FrameMetadata): string {
    const ogTags = `
  <meta property="og:title" content="${metadata.title}" />
  <meta property="og:description" content="${metadata.description}" />
  <meta property="og:image" content="${metadata.image}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${this.baseUrl}" />
    `.trim()

    const frameTags = `
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${metadata.image}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:post_url" content="${metadata.postUrl}" />
  ${metadata.input ? `<meta property="fc:frame:input:text" content="${metadata.input}" />` : ''}
  ${metadata.buttons.map((button, index) => 
    `<meta property="fc:frame:button:${index + 1}" content="${button.label}" />
     <meta property="fc:frame:button:${index + 1}:action" content="${button.action}" />
     ${button.target ? `<meta property="fc:frame:button:${index + 1}:target" content="${button.target}" />` : ''}`
  ).join('\n  ')}
    `.trim()

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${metadata.title}</title>
  
  ${ogTags}
  
  ${frameTags}
</head>
<body>
  <h1>${metadata.title}</h1>
  <p>${metadata.description}</p>
  <img src="${metadata.image}" alt="${metadata.title}" style="max-width: 100%; height: auto;" />
</body>
</html>`
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
   * Create frame action response
   */
  createFrameResponse(frameUrl: string, type: 'frame' | 'message' = 'frame') {
    return {
      type,
      frameUrl
    }
  },

  /**
   * Create transaction response for frame
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
   * Validate frame signature (for production use)
   */
  async validateFrameSignature(messageBytes: string): Promise<boolean> {
    // In production, you'd validate the frame signature here
    // This would involve verifying the message was signed by Farcaster
    return true
  },

  /**
   * Generate shareable frame URL
   */
  generateShareableFrameUrl(coinAddress: string, baseUrl?: string): string {
    const url = baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
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


function getBaseUrl(): string {
  // Explicit environment variable 
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

// Export singleton instance
export const frameGenerator = new FrameGenerator()