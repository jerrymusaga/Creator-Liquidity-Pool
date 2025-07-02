
import { NextRequest, NextResponse } from 'next/server'

interface PinataResponse {
  IpfsHash: string
  PinSize: number
  Timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const metadata = await request.json()

    // Validate metadata structure
    if (!metadata.name || !metadata.description) {
      return NextResponse.json(
        { error: 'Invalid metadata: name and description are required' },
        { status: 400 }
      )
    }

    if (process.env.PINATA_JWT) {
      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PINATA_JWT}`
          },
          body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
              name: `${metadata.name} - Vibe Creator Coin Metadata`,
              keyvalues: {
                platform: 'vibe',
                type: 'creator_coin_metadata',
                creator: metadata.properties?.creator || 'unknown'
              }
            },
            pinataOptions: {
              cidVersion: 1
            }
          })
        })

        if (!response.ok) {
          throw new Error(`Pinata error: ${response.statusText}`)
        }

        const pinataResult: PinataResponse = await response.json()
        
        return NextResponse.json({
          success: true,
          ipfsHash: pinataResult.IpfsHash,
          uri: `ipfs://${pinataResult.IpfsHash}`,
          gateway: `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`,
          size: pinataResult.PinSize
        })

      } catch (pinataError) {
        console.error('Pinata upload failed:', pinataError)
        // Fall through to alternative method
      }
    }


  } catch (error) {
    console.error('Metadata upload error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to upload metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  const services = {
    pinata: !!process.env.PINATA_JWT,
    web3Storage: !!process.env.WEB3_STORAGE_TOKEN,
    fallback: true
  }

  return NextResponse.json({
    status: 'IPFS Upload Service',
    availableServices: services,
    recommendation: services.pinata 
  })
}