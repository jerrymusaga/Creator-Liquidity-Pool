import { NextRequest, NextResponse } from 'next/server'
import { getCoin } from '@zoralabs/coins-sdk'
import { frameGenerator, frameUtils } from '@/lib/frameUtils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'view'

    // Get coin data from Zora
    const coinData = await getCoin({ 
      address: address as `0x${string}`
    })

    const coin = coinData?.data?.zora20Token
    if (!coin) {
      return new NextResponse('Coin not found', { status: 404 })
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    // Generate frame metadata based on action
    let frameMetadata
    switch (action) {
      case 'buy':
        frameMetadata = frameGenerator.generateBuyFrame(address, coin)
        break
      case 'sell':
        frameMetadata = frameGenerator.generateSellFrame(address, coin)
        break
      default:
        frameMetadata = frameGenerator.generateTradingFrame(address, coin)
    }

    return new NextResponse(
      frameGenerator.generateFrameHTML(frameMetadata),
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    )
  } catch (error) {
    console.error('Frame generation error:', error)
    return new NextResponse('Error generating frame', { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const body = await request.json()
    const frameMessage = frameUtils.parseFrameMessage(body)

    // Handle different button actions
    switch (frameMessage.buttonIndex) {
      case 1: // Buy button
        return handleBuyAction(address, frameMessage.inputText, frameMessage.fid)
      case 2: // Sell button
        return handleSellAction(address, frameMessage.inputText, frameMessage.fid)
      case 3: // View details
        return handleDetailsAction(address)
      case 4: // Share
        return handleShareAction(address)
      default:
        return handleViewAction(address)
    }
  } catch (error) {
    console.error('Frame POST error:', error)
    return new NextResponse('Error processing frame action', { status: 500 })
  }
}


async function handleBuyAction(address: string, inputText: string | undefined, fid: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return NextResponse.json(
    frameUtils.createFrameResponse(`${baseUrl}/api/frames/coin/${address}?action=buy`)
  )
}

async function handleSellAction(address: string, inputText: string | undefined, fid: number) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return NextResponse.json(
    frameUtils.createFrameResponse(`${baseUrl}/api/frames/coin/${address}?action=sell`)
  )
}

async function handleDetailsAction(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return NextResponse.json(
    frameUtils.createFrameResponse(`${baseUrl}/api/frames/coin/${address}?action=details`)
  )
}

async function handleShareAction(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return NextResponse.json(
    frameUtils.createFrameResponse(`${baseUrl}/api/frames/coin/${address}?action=share`)
  )
}

async function handleViewAction(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  return NextResponse.json(
    frameUtils.createFrameResponse(`${baseUrl}/api/frames/coin/${address}`)
  )
}