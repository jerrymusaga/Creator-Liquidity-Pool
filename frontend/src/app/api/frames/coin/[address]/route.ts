import { NextRequest, NextResponse } from 'next/server'
import { getCoin } from '@zoralabs/coins-sdk'
import { frameGenerator, frameUtils } from '@/lib/frameUtils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const body = await request.json()
    const frameMessage = frameUtils.parseFrameMessage(body)

    console.log('🎯 Frame POST received:', {
      address,
      buttonIndex: frameMessage.buttonIndex,
      inputText: frameMessage.inputText,
      fid: frameMessage.fid
    })

    // Get coin data for generating the response frame
    const coinData = await getCoin({ 
      address: address as `0x${string}`
    })

    const coin = coinData?.data?.zora20Token
    if (!coin) {
      return createErrorFrame('Coin not found')
    }

    // Handle different button actions
    switch (frameMessage.buttonIndex) {
      case 1: // Buy button
        return handleBuyAction(address, coin, frameMessage.inputText, frameMessage.fid)
      case 2: // Sell button
        return handleSellAction(address, coin, frameMessage.inputText, frameMessage.fid)
      case 3: // View details (link button - shouldn't reach here normally)
        return handleDetailsAction(address, coin)
      case 4: // Share
        return handleShareAction(address, coin)
      default:
        return handleViewAction(address, coin)
    }
  } catch (error) {
    console.error('Frame POST error:', error)
    return createErrorFrame('Error processing frame action')
  }
}

// Return HTML frame, not JSON
async function handleBuyAction(address: string, coin: any, inputText: string | undefined, fid: number) {
  console.log('🟢 Buy action triggered:', { address, inputText, fid })
  
  // Generate buy frame with input field
  const frameMetadata = frameGenerator.generateBuyFrame(address, coin, inputText)
  const html = frameGenerator.generateFrameHTML(frameMetadata)
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

// Return HTML frame, not JSON
async function handleSellAction(address: string, coin: any, inputText: string | undefined, fid: number) {
  console.log('🔴 Sell action triggered:', { address, inputText, fid })
  
  // Generate sell frame with input field
  const frameMetadata = frameGenerator.generateSellFrame(address, coin)
  const html = frameGenerator.generateFrameHTML(frameMetadata)
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

// Redirect for external links
async function handleDetailsAction(address: string, coin: any) {
  console.log('📊 Details action triggered:', { address })
  
  // For link buttons, return a redirect
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const detailsUrl = `${baseUrl}/coin/${address}`
  
  return NextResponse.redirect(detailsUrl, 302)
}

// Return HTML frame for share action
async function handleShareAction(address: string, coin: any) {
  console.log('🔗 Share action triggered:', { address })
  
  // Generate a sharing success frame
  const frameMetadata = {
    title: `Shared ${coin.symbol}!`,
    description: `You shared ${coin.name} creator coin`,
    image: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frames/coin/${address}/image?action=shared`,
    postUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frames/coin/${address}`,
    buttons: [
      { label: '🔙 Back to Trading', action: 'post' as const },
      { label: '📊 View Details', action: 'link' as const, target: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/coin/${address}` },
      { label: '🔗 Copy Link', action: 'post' as const },
      { label: '🚀 Trade More', action: 'post' as const }
    ]
  }
  
  const html = frameGenerator.generateFrameHTML(frameMetadata)
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

// Return to main trading frame
async function handleViewAction(address: string, coin: any) {
  console.log('👀 View action triggered:', { address })
  
  // Generate main trading frame
  const frameMetadata = frameGenerator.generateTradingFrame(address, coin)
  const html = frameGenerator.generateFrameHTML(frameMetadata)
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

// Helper function for error frames
function createErrorFrame(errorMessage: string) {
  const frameMetadata = {
    title: 'Error',
    description: errorMessage,
    image: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frames/error/image?message=${encodeURIComponent(errorMessage)}`,
    postUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/frames/discovery`,
    buttons: [
      { label: '🔙 Go Back', action: 'post' as const },
      { label: '🏠 Home', action: 'link' as const, target: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000' }
    ]
  }
  
  const html = frameGenerator.generateFrameHTML(frameMetadata)
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}