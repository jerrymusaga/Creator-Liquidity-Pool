import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const message = searchParams.get('message') || 'An error occurred'

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
              opacity: 0.1,
            }}
          />
          
          {/* Error Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
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
                fontSize: '40px',
              }}
            >
              ⚠️
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                margin: 0,
                color: '#F3F4F6'
              }}>
                Error
              </h1>
              <p style={{ 
                fontSize: '20px', 
                margin: 0, 
                color: '#9CA3AF',
                maxWidth: '400px',
                textAlign: 'center'
              }}>
                Something went wrong
              </p>
            </div>
          </div>

          {/* Error Message */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              padding: '30px 50px',
              borderRadius: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              maxWidth: '600px',
              textAlign: 'center'
            }}
          >
            <div style={{ 
              fontSize: '18px', 
              color: '#F87171',
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              Error Details:
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: '#FEE2E2',
              lineHeight: '1.5'
            }}>
              {message}
            </div>
          </div>

          {/* Help Text */}
          <div
            style={{
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '14px',
              maxWidth: '500px',
              lineHeight: '1.6'
            }}
          >
            <p style={{ margin: '0 0 10px 0' }}>
              This frame encountered an error. Please try again or contact support if the problem persists.
            </p>
            <p style={{ margin: 0 }}>
              You can return to the main app or try a different coin.
            </p>
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
              fontSize: '12px',
              color: '#6B7280',
            }}
          >
            <div>VibeStream Frame Error</div>
            <div>vibestream.app</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error image generation error:', error)
    
    // Fallback error image
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
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ fontSize: '72px', marginBottom: '20px' }}>❌</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>Frame Error</div>
          <div style={{ fontSize: '18px', marginTop: '10px', color: '#9CA3AF' }}>
            Unable to load frame content
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}