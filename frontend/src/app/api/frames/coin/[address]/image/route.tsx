import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getCoin } from '@zoralabs/coins-sdk'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'view'
    const amount = searchParams.get('amount')

    // Get coin data
    const coinData = await getCoin({ 
      address: address as `0x${string}`
    })

    const coin = coinData?.data?.zora20Token
    if (!coin) {
      return new Response('Coin not found', { status: 404 })
    }

    // Use the correct property for price
    const price = (coin as any).priceUSD ? parseFloat((coin as any).priceUSD) : 0
    const priceDisplay = price > 0 ? `$${price.toFixed(6)}` : 'N/A'
    const marketCap = coin.marketCap ? `$${(parseFloat(coin.marketCap) / 1000000).toFixed(1)}M` : 'N/A'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1F2937',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #10B981 100%)',
              opacity: 0.1,
            }}
          />
          
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '24px',
              }}
            >
              🪙
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                margin: 0,
                color: '#F3F4F6'
              }}>
                {coin.symbol}
              </h1>
              <p style={{ 
                fontSize: '18px', 
                margin: 0, 
                color: '#9CA3AF',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {coin.name}
              </p>
            </div>
          </div>

          {/* Price section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '30px',
              backgroundColor: 'rgba(55, 65, 81, 0.5)',
              padding: '20px 40px',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              color: '#8B5CF6'
            }}>
              {priceDisplay}
            </div>
            {action === 'buy' && amount && (
              <div style={{ 
                fontSize: '20px', 
                color: '#10B981',
                marginTop: '8px'
              }}>
                Buying {amount} ETH worth
              </div>
            )}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '20px',
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#EC4899'
              }}>
                {marketCap}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#9CA3AF' 
              }}>
                Market Cap
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#10B981'
              }}>
                {coin.totalSupply ? Math.floor(parseFloat(coin.totalSupply) / 1000) + 'K' : 'N/A'}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#9CA3AF' 
              }}>
                Supply
              </div>
            </div>
          </div>

          {/* Action indicator */}
          {action !== 'view' && (
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: action === 'buy' ? '#10B981' : action === 'sell' ? '#EF4444' : '#8B5CF6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              {action}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              right: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              color: '#6B7280',
            }}
          >
            <div>Trade on Base • Powered by Zora</div>
            <div>vibe.social</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Image generation error:', error)
    return new Response('Error generating image', { status: 500 })
  }
}