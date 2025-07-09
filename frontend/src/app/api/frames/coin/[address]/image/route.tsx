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
    const amount = searchParams.get('amount') || '0.01' // Default amount
    const type = searchParams.get('type') ?? undefined // for success frames
    const txHash = searchParams.get('txHash') ?? undefined

    console.log('🖼️ Generating frame image:', { address, action, amount, type })

    // Get coin data
    const coinData = await getCoin({ 
      address: address as `0x${string}`
    })

    const coin = coinData?.data?.zora20Token
    if (!coin) {
      return generateErrorImage('Coin not found')
    }

    // Fix price parsing - try multiple possible fields
    const price = getPrice(coin)
    const priceDisplay = price > 0 ? formatPrice(price) : 'N/A'
    
    // Fix market cap and volume parsing
    const marketCap = getMarketCap(coin)
    const volume24h = getVolume24h(coin)
    const holderCount = coin.uniqueHolders || 0

    console.log('💰 Parsed coin data:', {
      price,
      priceDisplay,
      marketCap,
      volume24h,
      holderCount,
      availableFields: Object.keys(coin)
    })

    // Generate different images based on action
    switch (action) {
      case 'buy':
        return generateBuyImage(coin, priceDisplay, amount)
      case 'sell':
        return generateSellImage(coin, priceDisplay)
      case 'success':
        return generateSuccessImage(coin, priceDisplay, type, amount, txHash)
      case 'shared':
        return generateSharedImage(coin, priceDisplay)
      default:
        return generateTradingImage(coin, priceDisplay, marketCap, volume24h, holderCount)
    }

  } catch (error) {
    console.error('Frame image generation error:', error)
    return generateErrorImage('Error generating frame image')
  }
}

// Helper functions to parse price data from different possible fields
function getPrice(coin: any): number {
  // Try multiple possible price fields
  const priceFields = [
    'priceUSD', 'currentPrice', 'price', 'priceEth', 'priceInEth',
    'pricePerToken', 'tokenPrice', 'lastPrice', 'latestPrice'
  ]
  
  for (const field of priceFields) {
    const value = coin[field]
    if (value && !isNaN(parseFloat(value))) {
      console.log(`📊 Using price field: ${field} = ${value}`)
      return parseFloat(value)
    }
  }
  
  console.warn('⚠️ No valid price field found in coin data')
  return 0
}

function getMarketCap(coin: any): string {
  const marketCapFields = ['marketCap', 'marketCapUSD', 'totalValue', 'marketCapEth']
  
  for (const field of marketCapFields) {
    const value = coin[field]
    if (value && !isNaN(parseFloat(value))) {
      const num = parseFloat(value)
      return num > 1000000 ? `$${(num / 1000000).toFixed(1)}M` : `$${(num / 1000).toFixed(1)}K`
    }
  }
  
  return 'N/A'
}

function getVolume24h(coin: any): number {
  const volumeFields = ['volume24h', 'dailyVolume', 'volume', 'volumeUSD', 'totalVolume']
  
  for (const field of volumeFields) {
    const value = coin[field]
    if (value && !isNaN(parseFloat(value))) {
      return parseFloat(value)
    }
  }
  
  return 0
}

function formatPrice(price: number): string {
  if (price === 0) return '$0'
  
  if (price < 0.000001) {
    return `$${price.toExponential(2)}`
  }
  
  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  }
  
  if (price < 1) {
    return `$${price.toFixed(4)}`
  }
  
  if (price < 1000) {
    return `$${price.toFixed(2)}`
  }
  
  return `$${(price / 1000).toFixed(1)}K`
}

// Generate main trading image
function generateTradingImage(coin: any, priceDisplay: string, marketCap: string, volume24h: number, holderCount: number) {
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
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '32px',
            }}
          >
            🪙
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              margin: 0,
              color: '#F3F4F6'
            }}>
              {coin.symbol}
            </h1>
            <p style={{ 
              fontSize: '24px', 
              margin: 0, 
              color: '#9CA3AF',
              maxWidth: '400px',
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
            marginBottom: '40px',
            backgroundColor: 'rgba(55, 65, 81, 0.5)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div style={{ 
            fontSize: '64px', 
            fontWeight: 'bold',
            color: '#8B5CF6',
            marginBottom: '10px'
          }}>
            {priceDisplay}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#10B981'
          }}>
            Trade directly in Farcaster
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: '60px',
            marginBottom: '30px',
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#EC4899'
            }}>
              {marketCap}
            </div>
            <div style={{ 
              fontSize: '16px', 
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
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#10B981'
            }}>
              {holderCount}
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#9CA3AF' 
            }}>
              Holders
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold',
              color: '#3B82F6'
            }}>
              ${(volume24h / 1000).toFixed(1)}K
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#9CA3AF' 
            }}>
              Volume 24h
            </div>
          </div>
        </div>

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
          <div>Trade on Base • Powered by Zora V4</div>
          <div>vibestream.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Fixed buy image generation
function generateBuyImage(coin: any, priceDisplay: string, amount: string) {
  const buyAmount = amount || '0.01'
  
  console.log('🟢 Generating buy image with:', { coinSymbol: coin.symbol, priceDisplay, buyAmount })
  
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
            background: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
            opacity: 0.15,
          }}
        />

        {/* Action indicator */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          BUY
        </div>
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '32px',
            }}
          >
            🪙
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              margin: 0,
              color: '#F3F4F6'
            }}>
              {coin.symbol}
            </h1>
            <p style={{ 
              fontSize: '24px', 
              margin: 0, 
              color: '#9CA3AF'
            }}>
              {coin.name}
            </p>
          </div>
        </div>

        {/* Buy info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '40px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ 
            fontSize: '24px', 
            color: '#10B981',
            marginBottom: '10px'
          }}>
            Buying {buyAmount} ETH worth
          </div>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: 'bold',
            color: '#10B981'
          }}>
            {priceDisplay}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#9CA3AF',
            marginTop: '10px'
          }}>
            Current Price per Token
          </div>
        </div>

        {/* Call to action */}
        <div style={{
          fontSize: '20px',
          color: '#D1FAE5',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          Click a buy button below to execute the trade
        </div>

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
          <div>One-click trading • Powered by Zora V4</div>
          <div>vibestream.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Generate sell action image
function generateSellImage(coin: any, priceDisplay: string) {
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
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
            opacity: 0.15,
          }}
        />

        {/* Action indicator */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#EF4444',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          SELL
        </div>
        
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '32px',
            }}
          >
            🪙
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              margin: 0,
              color: '#F3F4F6'
            }}>
              {coin.symbol}
            </h1>
            <p style={{ 
              fontSize: '24px', 
              margin: 0, 
              color: '#9CA3AF'
            }}>
              {coin.name}
            </p>
          </div>
        </div>

        {/* Sell info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '40px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ 
            fontSize: '24px', 
            color: '#EF4444',
            marginBottom: '10px'
          }}>
            Sell your tokens for ETH
          </div>
          <div style={{ 
            fontSize: '56px', 
            fontWeight: 'bold',
            color: '#EF4444'
          }}>
            {priceDisplay}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#9CA3AF',
            marginTop: '10px'
          }}>
            Current Price per Token
          </div>
        </div>

        {/* Call to action */}
        <div style={{
          fontSize: '20px',
          color: '#FECACA',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          Choose how much to sell below
        </div>

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
          <div>Instant settlement • Powered by Zora V4</div>
          <div>vibestream.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Generate success image
function generateSuccessImage(coin: any, priceDisplay: string, type?: string, amount?: string, txHash?: string) {
  const actionText = type === 'buy' ? 'Bought' : type === 'sell' ? 'Sold' : 'Traded'
  const amountText = amount ? ` ${amount} ${type === 'buy' ? 'ETH' : coin.symbol}` : ''
  
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
            background: 'linear-gradient(135deg, #10B981 0%, #059669 30%, #8B5CF6 70%, #EC4899 100%)',
            opacity: 0.15,
          }}
        />

        {/* Success indicator */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '20px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          SUCCESS
        </div>
        
        {/* Success icon */}
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '20px' 
        }}>
          ✅
        </div>

        {/* Success message */}
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          color: '#10B981',
          textAlign: 'center'
        }}>
          Trade Successful!
        </h1>

        <p style={{ 
          fontSize: '28px', 
          margin: '0 0 40px 0', 
          color: '#F3F4F6',
          textAlign: 'center'
        }}>
          {actionText}{amountText} {coin.symbol}
        </p>

        {/* Transaction details */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '30px'
          }}
        >
          <div style={{
            fontSize: '20px',
            color: '#9CA3AF',
            marginBottom: '10px'
          }}>
            Current Price: {priceDisplay}
          </div>
          {txHash && (
            <div style={{
              fontSize: '16px',
              color: '#6B7280',
              fontFamily: 'monospace'
            }}>
              TX: {txHash.slice(0, 16)}...
            </div>
          )}
        </div>

        {/* Call to action */}
        <div style={{
          fontSize: '18px',
          color: '#D1FAE5',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          🎉 Transaction complete! Share your success or trade again
        </div>

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
          <div>V4 Rewards: Creator earned automatically</div>
          <div>vibestream.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Generate shared image
function generateSharedImage(coin: any, priceDisplay: string) {
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
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 30%, #F59E0B 70%, #10B981 100%)',
            opacity: 0.15,
          }}
        />
        
        {/* Share icon */}
        <div style={{ 
          fontSize: '80px', 
          marginBottom: '20px' 
        }}>
          🚀
        </div>

        {/* Share message */}
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          margin: '0 0 10px 0',
          color: '#EC4899',
          textAlign: 'center'
        }}>
          Shared Successfully!
        </h1>

        <p style={{ 
          fontSize: '28px', 
          margin: '0 0 40px 0', 
          color: '#F3F4F6',
          textAlign: 'center'
        }}>
          You shared {coin.symbol} creator coin
        </p>

        {/* Encouragement */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            padding: '30px 60px',
            borderRadius: '20px',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            marginBottom: '30px',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '24px',
            color: '#EC4899',
            marginBottom: '15px'
          }}>
            🎯 Spread the word!
          </div>
          <div style={{
            fontSize: '18px',
            color: '#F3F4F6',
            lineHeight: 1.4
          }}>
            More traders = Higher value<br />
            Help this creator grow their economy
          </div>
        </div>

        {/* Current price */}
        <div style={{
          fontSize: '20px',
          color: '#D1D5DB'
        }}>
          Current Price: {priceDisplay}
        </div>

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
          <div>Frame shared to Farcaster</div>
          <div>vibestream.app</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

// Generate error image
function generateErrorImage(message: string) {
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
        }}
      >
        <div style={{ fontSize: '72px', marginBottom: '20px' }}>❌</div>
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Error</div>
        <div style={{ fontSize: '18px', color: '#9CA3AF', textAlign: 'center', maxWidth: '400px' }}>
          {message}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}