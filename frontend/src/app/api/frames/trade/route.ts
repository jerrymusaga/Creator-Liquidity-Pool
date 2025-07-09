

import { NextRequest, NextResponse } from 'next/server'
import { TradeParameters } from '@zoralabs/coins-sdk'
import { parseEther, createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

export async function POST(request: NextRequest) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url)
    const coinAddress = searchParams.get('coinAddress')
    const tradeType = searchParams.get('tradeType') // 'buy' | 'sell'
    const amount = searchParams.get('amount')
    const percentage = searchParams.get('percentage') // for sell orders
    const custom = searchParams.get('custom') === 'true'

    // Parse body for frame message data
    const body = await request.json()
    const frameMessage = body.untrustedData || {}
    const userAddress = frameMessage.address
    const inputText = frameMessage.inputText

    console.log('🎯 Transaction request:', {
      coinAddress,
      tradeType,
      amount,
      percentage,
      custom,
      userAddress,
      inputText
    })

    // Validate required parameters
    if (!coinAddress || !tradeType || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: coinAddress, tradeType, userAddress' },
        { status: 400 }
      )
    }

    // Determine the actual amount to trade
    let finalAmount: string
    
    if (tradeType === 'buy') {
      if (custom && inputText) {
        // Use input text for custom amount
        const parsedAmount = parseFloat(inputText)
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return NextResponse.json(
            { error: 'Invalid amount entered. Please enter a valid ETH amount.' },
            { status: 400 }
          )
        }
        finalAmount = parsedAmount.toString()
      } else {
        // Use predefined amount
        finalAmount = amount || '0.01'
      }
    } else {
      // For sell orders
      if (percentage) {
        // Calculate token amount based on percentage of holdings
        // Note: In a real implementation, you'd fetch the user's token balance
        // For now, we'll use a placeholder calculation
        const userBalance = 1000 // This should be fetched from the blockchain
        const percentageNum = parseFloat(percentage)
        finalAmount = (userBalance * percentageNum / 100).toString()
      } else if (custom && inputText) {
        const parsedAmount = parseFloat(inputText)
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return NextResponse.json(
            { error: 'Invalid token amount entered.' },
            { status: 400 }
          )
        }
        finalAmount = parsedAmount.toString()
      } else {
        return NextResponse.json(
          { error: 'No sell amount specified' },
          { status: 400 }
        )
      }
    }

    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org')
    })

    // Parse amount based on trade type
    const amountIn = tradeType === 'buy' 
      ? parseEther(finalAmount) // ETH amount for buying
      : BigInt(Math.floor(parseFloat(finalAmount))) // Token amount for selling

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

    console.log('📋 Trade parameters:', tradeParameters)

    // Create trade call to get transaction data
    const { createTradeCall } = await import('@zoralabs/coins-sdk')
    const quote = await createTradeCall(tradeParameters)

    console.log('✅ Transaction prepared:', {
      target: quote.call.target,
      value: quote.call.value.toString(),
      dataLength: quote.call.data.length
    })

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

  } catch (error: any) {
    console.error('❌ Trade API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create trade transaction',
        details: error.message 
      },
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
        { error: 'Missing required parameters: coinAddress, tradeType, amount' },
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
        amountOut: quote.quote?.amountOut?.toString() || '0',
        slippage: quote.quote?.slippage || 0,
      }
    })

  } catch (error: any) {
    console.error('❌ Quote API error:', error)
    return NextResponse.json(
      { error: 'Failed to get trade quote', details: error.message },
      { status: 500 }
    )
  }
}