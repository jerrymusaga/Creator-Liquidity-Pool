// config/zora.ts
import { setApiKey } from "@zoralabs/coins-sdk";

// Zora API configuration
export const ZORA_CONFIG = {
  // Set your Zora API key from environment variables
  apiKey: process.env.NEXT_PUBLIC_ZORA_API_KEY,
  
  // Default pagination settings
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Cache settings
  cacheTime: 1000 * 60 * 5, // 5 minutes
  staleTime: 1000 * 60 * 2, // 2 minutes
};

// Initialize Zora SDK
export function initializeZoraSDK() {
  if (ZORA_CONFIG.apiKey) {
    setApiKey(ZORA_CONFIG.apiKey);
    console.log('Zora SDK initialized with API key');
  } else {
    console.warn('Zora API key not found. Some features may be limited.');
  }
}

// Call this on app initialization
if (typeof window !== 'undefined') {
  initializeZoraSDK();
}