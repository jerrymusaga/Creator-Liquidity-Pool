import { tradeCoin, TradeParameters, createTradeCall } from '@zoralabs/coins-sdk'
import { parseEther, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'
import type { WalletClient } from 'viem'

export interface FrameTradeParams {
  coinAddress: string
  tradeType: 'buy' | 'sell'
  amount: string | number
  userAddress: string
  slippage?: number
}

export interface TradeQuote {
  amountIn: string
  amountOut: string
  priceImpact: number
  gasEstimate: string
  route?: string[]
}

export class FrameTradingService {
  private publicClient: any

  constructor() {
    this.publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
    })
  }

  /**
   * Execute a trade transaction using Zora SDK
   */
  async executeTrade(
    params: FrameTradeParams,
    walletClient: WalletClient,
    account: any
  ) {
    try {
      const tradeParameters = this.buildTradeParameters(params)
      
      const receipt = await tradeCoin({
        tradeParameters,
        walletClient,
        account,
        publicClient: this.publicClient,
        validateTransaction: true,
      })

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        receipt
      }
    } catch (error) {
      console.error('Trade execution failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get a trade quote without executing
   */
  async getTradeQuote(params: FrameTradeParams): Promise<TradeQuote> {
    try {
      const tradeParameters = this.buildTradeParameters(params)
      const quote = await createTradeCall(tradeParameters)

      return {
        amountIn: tradeParameters.amountIn.toString(),
        amountOut: quote.quote?.amountOut?.toString() || '0',
        priceImpact: 0, // Not available in the quote structure
        gasEstimate: '0', // Not available in the quote structure
        route: [] // Not available in the quote structure
      }
    } catch (error) {
      console.error('Quote generation failed:', error)
      throw new Error('Failed to generate trade quote')
    }
  }

  /**
   * Create transaction data for frame execution
   */
  async createFrameTransaction(params: FrameTradeParams) {
    try {
      const tradeParameters = this.buildTradeParameters(params)
      const quote = await createTradeCall(tradeParameters)

      return {
        chainId: `eip155:${base.id}`,
        method: 'eth_sendTransaction',
        params: {
          to: quote.call.target,
          data: quote.call.data,
          value: quote.call.value.toString(),
        },
      }
    } catch (error) {
      console.error('Frame transaction creation failed:', error)
      throw new Error('Failed to create frame transaction')
    }
  }

  /**
   * Build trade parameters for Zora SDK
   */
  private buildTradeParameters(params: FrameTradeParams): TradeParameters {
    const { coinAddress, tradeType, amount, userAddress, slippage } = params

    const amountIn = tradeType === 'buy' 
      ? parseEther(amount.toString()) 
      : BigInt(amount)

    const defaultSlippage = tradeType === 'buy' ? 0.05 : 0.15 // 5% for buy, 15% for sell

    if (tradeType === 'buy') {
      return {
        sell: { type: "eth" },
        buy: {
          type: "erc20",
          address: coinAddress as `0x${string}`,
        },
        amountIn,
        slippage: slippage || defaultSlippage,
        sender: userAddress as `0x${string}`,
      }
    } else {
      return {
        sell: { 
          type: "erc20", 
          address: coinAddress as `0x${string}`
        },
        buy: { type: "eth" },
        amountIn,
        slippage: slippage || defaultSlippage,
        sender: userAddress as `0x${string}`,
      }
    }
  }

  /**
   * Validate trade parameters
   */
  validateTradeParams(params: FrameTradeParams): { valid: boolean; error?: string } {
    const { coinAddress, tradeType, amount, userAddress } = params

    if (!coinAddress || !coinAddress.startsWith('0x') || coinAddress.length !== 42) {
      return { valid: false, error: 'Invalid coin address' }
    }

    if (!['buy', 'sell'].includes(tradeType)) {
      return { valid: false, error: 'Invalid trade type' }
    }

    if (!userAddress || !userAddress.startsWith('0x') || userAddress.length !== 42) {
      return { valid: false, error: 'Invalid user address' }
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return { valid: false, error: 'Invalid amount' }
    }

    return { valid: true }
  }

  /**
   * Calculate estimated tokens received for ETH amount
   */
  async estimateTokensForEth(coinAddress: string, ethAmount: string): Promise<string> {
    try {
      const quote = await this.getTradeQuote({
        coinAddress,
        tradeType: 'buy',
        amount: ethAmount,
        userAddress: '0x0000000000000000000000000000000000000000' // Placeholder
      })
      
      return quote.amountOut
    } catch (error) {
      console.error('Estimation failed:', error)
      return '0'
    }
  }

  /**
   * Calculate estimated ETH for token amount
   */
  async estimateEthForTokens(coinAddress: string, tokenAmount: string): Promise<string> {
    try {
      const quote = await this.getTradeQuote({
        coinAddress,
        tradeType: 'sell',
        amount: tokenAmount,
        userAddress: '0x0000000000000000000000000000000000000000' // Placeholder
      })
      
      return quote.amountOut
    } catch (error) {
      console.error('Estimation failed:', error)
      return '0'
    }
  }
}

// Singleton instance
export const frameTradingService = new FrameTradingService()

// Helper functions for frame integration
export const frameTradeHelpers = {
  /**
   * Format amount for display in frames
   */
  formatAmount(amount: string | bigint, decimals: number = 18): string {
    const bigintAmount = typeof amount === 'string' ? BigInt(amount) : amount
    const divisor = BigInt(10 ** decimals)
    const quotient = bigintAmount / divisor
    const remainder = bigintAmount % divisor
    
    if (remainder === BigInt(0)) {
      return quotient.toString()
    }
    
    const fractional = remainder.toString().padStart(decimals, '0')
    const trimmed = fractional.replace(/0+$/, '')
    
    return trimmed.length > 0 ? `${quotient}.${trimmed}` : quotient.toString()
  },

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    if (price >= 1) {
      return `$${price.toFixed(4)}`
    } else if (price >= 0.0001) {
      return `$${price.toFixed(6)}`
    } else {
      return `$${price.toExponential(2)}`
    }
  },

  /**
   * Calculate percentage change
   */
  calculatePriceChange(oldPrice: number, newPrice: number): string {
    const change = ((newPrice - oldPrice) / oldPrice) * 100
    const prefix = change >= 0 ? '+' : ''
    return `${prefix}${change.toFixed(2)}%`
  },

  /**
   * Parse frame input for trade amounts
   */
  parseTradeInput(input: string): { amount: number; valid: boolean } {
    const trimmed = input.trim()
    const amount = parseFloat(trimmed)
    
    return {
      amount: isNaN(amount) ? 0 : amount,
      valid: !isNaN(amount) && amount > 0
    }
  }
}