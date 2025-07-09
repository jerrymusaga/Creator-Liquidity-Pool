import { frameUtils } from '@/lib/frameUtils'
import toast from 'react-hot-toast'

export const shareCoinsAsFrame = async (coin: any, customMessage?: string) => {
  // Generate frame URL for the coin
  const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
  
  // Create compelling share text
  const defaultMessage = customMessage || generateShareMessage(coin)
  
  try {
    // Improved context detection - be more specific about mobile vs desktop
    const isMobileFarcasterApp = typeof window !== 'undefined' && (
      navigator.userAgent.includes('Farcaster') ||
      navigator.userAgent.includes('Mobile') && (
        window.location.hostname.includes('warpcast') ||
        window.location.hostname.includes('farcaster')
      )
    )

    // Check if we're in a Farcaster miniapp/iframe (mobile)
    const isFarcasterMiniapp = typeof window !== 'undefined' && (
      (window as any).farcaster ||
      (window as any).parent !== window && (
        document.referrer.includes('farcaster') ||
        document.referrer.includes('warpcast')
      )
    )

    // Desktop Farcaster should NOT be treated as "in Farcaster context"
    const isDesktopFarcaster = typeof window !== 'undefined' && (
      window.location.hostname.includes('warpcast') ||
      window.location.hostname.includes('farcaster')
    ) && !navigator.userAgent.includes('Mobile')

    console.log('🔍 Share context detection:', {
      isMobileFarcasterApp,
      isFarcasterMiniapp,
      isDesktopFarcaster,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      hasFarcasterAPI: typeof window !== 'undefined' ? !!(window as any).farcaster : false
    })

    // Handle mobile Farcaster app or miniapp
    if (isMobileFarcasterApp || isFarcasterMiniapp) {
      // Try Farcaster APIs first
      if ((window as any).farcaster?.createCast) {
        console.log('🎯 Using Farcaster createCast API')
        await (window as any).farcaster.createCast({
          text: defaultMessage,
          embeds: [frameUrl]
        })
        toast.success('Frame shared in Farcaster! 🎯', { duration: 4000 })
        return
      }

      // Try postMessage to parent frame
      if ((window as any).parent && (window as any).parent.postMessage) {
        console.log('🎯 Attempting postMessage to parent frame')
        try {
          (window as any).parent.postMessage({
            type: 'createCast',
            data: {
              text: defaultMessage,
              embeds: [frameUrl]
            }
          }, '*')
          toast.success('Frame shared! 🎯', { duration: 3000 })
          return
        } catch (postMessageError) {
          console.warn('PostMessage failed:', postMessageError)
        }
      }

      // Mobile fallback: try native sharing
      if (navigator.share) {
        console.log('🎯 Using native share API on mobile')
        await navigator.share({
          title: `${coin.name} (${coin.symbol}) on VibeStream`,
          text: defaultMessage,
          url: frameUrl
        })
        toast.success('Shared as interactive trading frame! 🎯', { duration: 4000 })
        return
      }

      // Mobile clipboard fallback
      await navigator.clipboard.writeText(`${defaultMessage}\n\n${frameUrl}`)
      toast.success(
        <div>
          <p><strong>Frame URL copied!</strong></p>
          <p className="text-sm mt-1">Paste in Farcaster to share the interactive trading card</p>
        </div>, 
        { duration: 6000 }
      )
      return
    }

    // Handle desktop (including desktop Farcaster) - always try to open Warpcast
    console.log('🎯 Desktop context - opening Warpcast compose')
    
    // Try native sharing API first (some desktop browsers support it)
    if (navigator.share) {
      try {
        console.log('🎯 Using native share API on desktop')
        await navigator.share({
          title: `${coin.name} (${coin.symbol}) on VibeStream`,
          text: defaultMessage,
          url: frameUrl
        })
        toast.success('Shared as interactive trading frame! 🎯', { duration: 4000 })
        return
      } catch (shareError) {
        console.log('Native share failed, falling back to Warpcast')
      }
    }

    // Desktop: Open Warpcast with frame
    const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrl, defaultMessage)
    console.log('🎯 Opening Warpcast URL:', warpcastUrl)
    
    // Try to open in new tab
    const newWindow = window.open(warpcastUrl, '_blank', 'noopener,noreferrer,width=600,height=800')
    
    if (newWindow) {
      // Check if window actually opened (not blocked)
      setTimeout(() => {
        if (newWindow.closed) {
          console.log('❌ Popup was blocked or closed immediately')
          fallbackToClipboard()
        } else {
          console.log('✅ Warpcast opened successfully')
          toast.success(
            <div>
              <p><strong>Opening Warpcast...</strong></p>
              <p className="text-sm mt-1">Frame ready to share in the compose window!</p>
            </div>,
            { duration: 4000 }
          )
        }
      }, 100)
    } else {
      console.log('❌ Popup blocked')
      fallbackToClipboard()
    }

    // Fallback function for clipboard copy
    function fallbackToClipboard() {
      console.log('🔄 Falling back to clipboard copy')
      navigator.clipboard.writeText(`${defaultMessage}\n\n${frameUrl}`)
        .then(() => {
          toast.success(
            <div>
              <p><strong>Frame URL copied!</strong></p>
              <p className="text-sm mt-1">Popup was blocked. Open Warpcast and paste to share</p>
              <button 
                onClick={() => window.open('https://warpcast.com/~/compose', '_blank')}
                className="mt-2 px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600"
              >
                Open Warpcast
              </button>
            </div>, 
            { duration: 8000 }
          )
        })
        .catch(() => {
          toast.error('Failed to copy URL. Please try again.')
        })
    }
    
  } catch (error) {
    console.error('❌ Share failed:', error)
    
    // Ultimate fallback: Copy frame URL with instructions
    try {
      await navigator.clipboard.writeText(`${defaultMessage}\n\n${frameUrl}`)
      toast.success(
        <div>
          <p><strong>Frame URL copied!</strong></p>
          <p className="text-sm mt-1">Paste in Farcaster to create interactive trading card</p>
          <p className="text-xs mt-2 opacity-75">Users can buy/sell directly in the frame</p>
        </div>, 
        { duration: 8000 }
      )
    } catch (clipboardError) {
      console.error('❌ Clipboard also failed:', clipboardError)
      toast.error('Failed to share frame. Please try again.')
    }
  }
}

// Enhanced share message generation with more variety and coin-specific data
const generateShareMessage = (coin: any) => {
  const priceInfo = coin.currentPrice && parseFloat(coin.currentPrice) > 0 
    ? ` at $${parseFloat(coin.currentPrice).toFixed(6)}` 
    : ''
  
  const holderInfo = coin.holderCount ? ` • ${coin.holderCount} holders` : ''
  
  const volumeInfo = coin.volume24h && parseFloat(coin.volume24h) > 0
    ? ` • $${(parseFloat(coin.volume24h) / 1000).toFixed(1)}K vol`
    : ''

  // Different message styles based on coin performance
  const isHighVolume = coin.volume24h && parseFloat(coin.volume24h) > 10000
  const isNewCoin = coin.holderCount && coin.holderCount < 50
  const isPriceRising = coin.priceChange24h && parseFloat(coin.priceChange24h) > 0

  if (isHighVolume) {
    return `🔥 ${coin.symbol} is PUMPING!${priceInfo}${volumeInfo} - massive volume! Trade directly in this frame ⬇️`
  }
  
  if (isNewCoin) {
    return `🌟 Early gem alert: ${coin.name} (${coin.symbol})${priceInfo}${holderInfo}. Get in early - trade instantly below!`
  }
  
  if (isPriceRising) {
    return `🚀 ${coin.symbol} gaining momentum!${priceInfo} +${parseFloat(coin.priceChange24h).toFixed(1)}%${holderInfo}. Don't miss out!`
  }

  // General messages with variety
  const messages = [
    `🚀 ${coin.symbol} is trending! Check out this creator coin${priceInfo}${holderInfo} - trade directly in the frame!`,
    `💎 Found a gem: ${coin.name} (${coin.symbol})${priceInfo}${volumeInfo}. One-click trading below ⬇️`,
    `🔥 ${coin.symbol} creator coin${priceInfo}! Interactive trading frame - buy/sell instantly`,
    `⚡ ${coin.name} has serious potential!${priceInfo}${holderInfo} Trade ${coin.symbol} directly in this frame`,
    `🎯 Alpha alert: ${coin.symbol}${priceInfo} could be the next big thing! Tap to trade ⬇️`,
    `🌟 Rising star: ${coin.name} (${coin.symbol})${priceInfo}${holderInfo}. Interactive trading card below!`,
    `🚨 Creator coin spotlight: ${coin.symbol}${priceInfo}${volumeInfo}! Trade directly in this frame`,
    `💰 ${coin.name} trading frame${priceInfo}! Buy/sell with one tap - no app switching needed`
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}

// Helper function to validate frame URLs
export const validateFrameUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname.includes('/api/frames/') && 
           (parsedUrl.protocol === 'https:' || parsedUrl.hostname === 'localhost')
  } catch {
    return false
  }
}

// Enhanced sharing with different strategies for different contexts
export const shareCoinsAsFrameAdvanced = async (
  coin: any, 
  options: {
    message?: string
    context?: 'trending' | 'discovery' | 'success' | 'custom'
    rank?: number
    includeStats?: boolean
  } = {}
) => {
  const { message, context = 'custom', rank, includeStats = true } = options
  
  // Generate context-specific message
  let shareMessage = message
  if (!shareMessage) {
    switch (context) {
      case 'trending':
        shareMessage = rank 
          ? `🏆 #${rank} trending creator coin: ${coin.symbol} is dominating! Trade directly below`
          : `🔥 Trending now: ${coin.symbol} is gaining massive traction! Interactive trading frame`
        break
      case 'discovery':
        shareMessage = `💎 Hidden gem discovered: ${coin.name} (${coin.symbol}). Early opportunity - trade instantly!`
        break
      case 'success':
        shareMessage = `✅ Just traded ${coin.symbol} successfully! Join the momentum - trade directly in this frame`
        break
      default:
        shareMessage = generateShareMessage(coin)
    }
  }
  
  // Add stats if requested
  if (includeStats && coin) {
    const stats = []
    if (coin.currentPrice) stats.push(`$${parseFloat(coin.currentPrice).toFixed(6)}`)
    if (coin.holderCount) stats.push(`${coin.holderCount} holders`)
    if (coin.volume24h) stats.push(`$${(parseFloat(coin.volume24h) / 1000).toFixed(1)}K vol`)
    
    if (stats.length > 0) {
      shareMessage += `\n\n📊 ${stats.join(' • ')}`
    }
  }
  
  return shareCoinsAsFrame(coin, shareMessage)
}

// Improved utility to detect if we're in different Farcaster contexts
export const detectFarcasterContext = () => {
  if (typeof window === 'undefined') return 'server'
  
  const hostname = window.location.hostname
  const userAgent = navigator.userAgent
  const hasAPI = !!(window as any).farcaster
  const isFrame = window !== window.parent
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  if (hostname.includes('warpcast') && isMobile) return 'warpcast-mobile'
  if (hostname.includes('warpcast') && !isMobile) return 'warpcast-desktop'
  if (hostname.includes('farcaster') && isMobile) return 'farcaster-mobile'
  if (hostname.includes('farcaster') && !isMobile) return 'farcaster-desktop'
  if (userAgent.includes('Farcaster')) return 'farcaster-native-app'
  if (hasAPI) return 'farcaster-with-api'
  if (isFrame) return 'iframe-miniapp'
  
  return 'external'
}