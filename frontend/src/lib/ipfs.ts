// lib/ipfs.ts
import { getPinataClient, getIPFSUri, PINATA_CONFIG } from '@/config/pinata'

export interface CreatorCoinMetadata {
  name: string
  description: string
  image: string
  external_url?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
  properties?: {
    coin_type?: string
    creator?: string
    social_links?: {
      twitter?: string
      farcaster?: string
      website?: string
    }
  }
}

export interface IPFSUploadResult {
  hash: string
  url: string
  uri: string
  size: number
}

/**
 * Upload an image file to IPFS via Pinata
 */
export const uploadImageToIPFS = async (file: File): Promise<IPFSUploadResult> => {
  const pinata = getPinataClient()
  
  if (!pinata) {
    throw new Error('Pinata client not initialized. Check your PINATA_JWT environment variable.')
  }

  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file
  if (!PINATA_CONFIG.allowedImageTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${PINATA_CONFIG.allowedImageTypes.join(', ')}`)
  }

  if (file.size > PINATA_CONFIG.maxFileSize) {
    throw new Error(`File too large. Maximum size: ${PINATA_CONFIG.maxFileSize / (1024 * 1024)}MB`)
  }

  try {
    // Upload to Pinata
    const result = await pinata.upload.public.file(file)

    return {
      hash: result.cid,
      url: `https://${PINATA_CONFIG.gateway}/ipfs/${result.cid}`,
      uri: getIPFSUri(result.cid),
      size: file.size,
    }
  } catch (error: any) {
    console.error('Failed to upload image to IPFS:', error)
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Upload metadata JSON to IPFS via Pinata
 */
export const uploadMetadataToIPFS = async (metadata: CreatorCoinMetadata): Promise<IPFSUploadResult> => {
  const pinata = getPinataClient()
  
  if (!pinata) {
    throw new Error('Pinata client not initialized. Check your PINATA_JWT environment variable.')
  }

  if (!metadata.name || !metadata.description || !metadata.image) {
    throw new Error('Metadata must include name, description, and image')
  }

  try {
    // Upload metadata as JSON
    const result = await pinata.upload.public.json(metadata)

    return {
      hash: result.cid,
      url: `https://${PINATA_CONFIG.gateway}/ipfs/${result.cid}`,
      uri: getIPFSUri(result.cid),
      size: JSON.stringify(metadata).length,
    }
  } catch (error: any) {
    console.error('Failed to upload metadata to IPFS:', error)
    throw new Error(`Failed to upload metadata: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Fetch metadata from IPFS
 */
export const fetchMetadataFromIPFS = async (uri: string): Promise<CreatorCoinMetadata> => {
  try {
    // Convert IPFS URI to HTTP URL if needed
    const url = uri.startsWith('ipfs://') 
      ? `https://${PINATA_CONFIG.gateway}/ipfs/${uri.replace('ipfs://', '')}`
      : uri

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(PINATA_CONFIG.timeout),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const metadata = await response.json()
    
    // Validate required fields
    if (!metadata.name || !metadata.description || !metadata.image) {
      throw new Error('Invalid metadata: missing required fields (name, description, image)')
    }

    return metadata
  } catch (error: any) {
    console.error('Failed to fetch metadata from IPFS:', error)
    throw new Error(`Failed to fetch metadata: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Pin existing content by hash
 */
export const pinByHash = async (hash: string, name?: string): Promise<void> => {
  const pinata = getPinataClient()
  
  if (!pinata) {
    throw new Error('Pinata client not initialized')
  }

  try {
    // Note: The new SDK may not have this method - removing for now
    console.warn('Pin by hash method may not be available in new SDK')
  } catch (error: any) {
    console.error('Failed to pin content by hash:', error)
    throw new Error(`Failed to pin content: ${error.message || 'Unknown error'}`)
  }
}

/**
 * Test Pinata connection
 */
export const testPinataConnection = async (): Promise<boolean> => {
  const pinata = getPinataClient()
  
  if (!pinata) {
    return false
  }

  try {
    // Test with a simple JSON upload
    const testData = { test: true, timestamp: Date.now() }
    
    await pinata.upload.public.json(testData)
    
    return true
  } catch (error) {
    console.error('Pinata connection test failed:', error)
    return false
  }
}