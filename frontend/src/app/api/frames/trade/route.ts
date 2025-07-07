import { NextRequest, NextResponse } from 'next/server'
import { tradeCoin, TradeParameters } from '@zoralabs/coins-sdk'
import { parseEther, createPublicClient, http, createWalletClient } from 'viem'
import { base } from 'viem/chains'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      coinAddress, 
      tradeType, // 'buy' | 'sell'
      amount, 
      userAddress,
      fid 
    } = body

    // Validate required parameters
    if (!coinAddress || !tradeType || !amount || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
    })

    // Parse amount based on trade type
    const amountIn = tradeType === 'buy' 
      ? parseEther(amount.toString()) // ETH amount for buying
      : BigInt(amount) // Token amount for selling

    // Set up trade parameters
    const tradeParameters: TradeParameters = tradeType === 'buy' 
      ? {
          sell: { type: "eth" },
          buy: {
            type: "erc20",
            address: coinAddress as `0x${string}`,
          },
          amountIn,
          slippage: 0.05, // 5% slippage tolerance
          sender: userAddress as `0x${string}`,
        }
      : {
          sell: { 
            type: "erc20", 
            address: coinAddress as `0x${string}`
          },
          buy: { type: "eth" },
          amountIn,
          slippage: 0.15, // 15% slippage tolerance for selling
          sender: userAddress as `0x${string}`,
        }

    // For frames, we need to return transaction data for the user to sign
    // We'll use createTradeCall to get the transaction data
    const { createTradeCall } = await import('@zoralabs/coins-sdk')
    
    const quote = await createTradeCall(tradeParameters)

    // Return transaction data for frame to execute
    return NextResponse.json({
      chainId: `eip155:${base.id}`,
      method: 'eth_sendTransaction',
      params: {
        abi: [], // Will be handled by Zora SDK
        to: quote.call.target,
        data: quote.call.data,
        value: quote.call.value.toString(),
      },
    })

  } catch (error) {
    console.error('Trade API error:', error)
    return NextResponse.json(
      { error: 'Failed to create trade transaction' },
      { status: 500 }
    )
  }
}

// GET endpoint for trade quotes/estimates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coinAddress = searchParams.get('coinAddress')
    const tradeType = searchParams.get('tradeType')
    const amount = searchParams.get('amount')

    if (!coinAddress || !tradeType || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create a quote without executing
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
    })

    const amountIn = tradeType === 'buy' 
      ? parseEther(amount) 
      : BigInt(amount)

    const tradeParameters: TradeParameters = tradeType === 'buy' 
      ? {
          sell: { type: "eth" },
          buy: { type: "erc20", address: coinAddress as `0x${string}` },
          amountIn,
          slippage: 0.05,
          sender: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Placeholder
        }
      : {
          sell: { type: "erc20", address: coinAddress as `0x${string}` },
          buy: { type: "eth" },
          amountIn,
          slippage: 0.15,
          sender: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Placeholder
        }

    const { createTradeCall } = await import('@zoralabs/coins-sdk')
    const quote = await createTradeCall(tradeParameters)

    return NextResponse.json({
      quote: {
        amountIn: amountIn.toString(),
        amountOut: quote.amountOut?.toString() || '0',
        priceImpact: quote.priceImpact || 0,
        gasEstimate: quote.gasEstimate?.toString() || '0',
      }
    })

  } catch (error) {
    console.error('Quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to get trade quote' },
      { status: 500 }
    )
  }
}