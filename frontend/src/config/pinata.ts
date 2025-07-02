// config/pinata.ts
import { PinataSDK } from "pinata"

// Pinata configuration
export const PINATA_CONFIG = {
  jwt: process.env.NEXT_PUBLIC_PINATA_JWT || process.env.PINATA_JWT,
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud',
  // File upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  // IPFS settings
  timeout: 60000, // 60 seconds
}

// Initialize Pinata SDK
let pinataInstance: PinataSDK | null = null

export const getPinataClient = () => {
  if (!pinataInstance && PINATA_CONFIG.jwt) {
    try {
      pinataInstance = new PinataSDK({
        pinataJwt: PINATA_CONFIG.jwt,
        pinataGateway: PINATA_CONFIG.gateway,
      })
    } catch (error) {
      console.warn('Failed to initialize Pinata SDK:', error)
    }
  }
  return pinataInstance
}

// Utility functions
export const isValidImageFile = (file: File): boolean => {
  return PINATA_CONFIG.allowedImageTypes.includes(file.type) && 
         file.size <= PINATA_CONFIG.maxFileSize
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getIPFSUrl = (hash: string): string => {
  return `https://${PINATA_CONFIG.gateway}/ipfs/${hash}`
}

export const getIPFSUri = (hash: string): string => {
  return `ipfs://${hash}`
}