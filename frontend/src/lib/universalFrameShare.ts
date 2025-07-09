import { frameUtils } from '@/lib/frameUtils'
import toast from 'react-hot-toast'

export const shareCoinsAsFrame = async (coin: any, customMessage?: string) => {
  // Generate frame URL for the coin
  const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
  
  // Create compelling share text
  const defaultMessage = customMessage || generateShareMessage(coin)
  
  try {
    // Try native sharing first (mobile)
    if (navigator.share) {
      await navigator.share({
        title: `${coin.name} (${coin.symbol}) on VibeStream`,
        text: defaultMessage,
        url: frameUrl
      })
    } else {
      // Desktop: Open Warpcast with frame
      const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrl, defaultMessage)
      window.open(warpcastUrl, '_blank')
    }
    
    toast.success('Shared as interactive trading frame! 🎯')
  } catch (error) {
    // Fallback: Copy frame URL
    navigator.clipboard.writeText(`${defaultMessage}\n\n${frameUrl}`)
    toast.success('Frame URL copied! Paste in Farcaster to create interactive trading card.')
  }
}

const generateShareMessage = (coin: any) => {
  const messages = [
    `🚀 ${coin.symbol} is trending! Check out this creator coin with huge potential`,
    `💎 Found a gem: ${coin.name} (${coin.symbol}) - trade it directly in this frame!`,
    `🔥 ${coin.symbol} is pumping! Don't miss out - trade directly below`,
    `⚡ ${coin.name} has serious potential! Trade ${coin.symbol} in this interactive frame`,
    `🎯 Alpha alert: ${coin.symbol} could be the next big thing! Trade now ⬇️`
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}