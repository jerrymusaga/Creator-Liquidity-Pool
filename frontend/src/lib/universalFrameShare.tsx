import { frameUtils } from '@/lib/frameUtils'
import toast from 'react-hot-toast'

export const shareCoinsAsFrame = async (coin: any, customMessage?: string) => {
  // Generate frame URL for the coin
  const frameUrl = frameUtils.generateShareableFrameUrl(coin.address)
  
  // Create compelling share text
  const defaultMessage = customMessage || generateShareMessage(coin)
  
  try {
    // Check if we're in a Farcaster context
    const isFarcasterContext = typeof window !== 'undefined' && (
      window.location.hostname.includes('warpcast') ||
      window.location.hostname.includes('farcaster') ||
      window.location.hostname.includes('frames') ||
      (window as any).farcaster ||
      (window as any).parent !== window || // In iframe/miniapp
      navigator.userAgent.includes('Farcaster')
    )

    console.log('🔍 Share context detection:', {
      isFarcasterContext,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      hasFarcasterAPI: typeof window !== 'undefined' ? !!(window as any).farcaster : false
    })

    if (isFarcasterContext) {
      // If we're in Farcaster miniapp, try to use Farcaster APIs
      if ((window as any).farcaster?.createCast) {
        console.log('🎯 Using Farcaster createCast API')
        await (window as any).farcaster.createCast({
          text: defaultMessage,
          embeds: [frameUrl]
        })
        toast.success('Frame shared in Farcaster! 🎯', { duration: 4000 })
        return
      }

      // Check for other Farcaster frame APIs
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
      
      // Fallback: copy to clipboard with instructions for Farcaster users
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

    // Try native sharing API (mobile)
    if (navigator.share) {
      console.log('🎯 Using native share API')
      await navigator.share({
        title: `${coin.name} (${coin.symbol}) on VibeStream`,
        text: defaultMessage,
        url: frameUrl
      })
      toast.success('Shared as interactive trading frame! 🎯', { duration: 4000 })
    } else {
      // Desktop: Open Warpcast with frame
      console.log('🎯 Opening Warpcast with frame URL')
      const warpcastUrl = frameUtils.generateWarpcastShareUrl(frameUrl, defaultMessage)
      
      // Open in new tab
      const newWindow = window.open(warpcastUrl, '_blank', 'noopener,noreferrer')
      
      if (newWindow) {
        toast.success(
          <div>
            <p><strong>Opening Warpcast...</strong></p>
            <p className="text-sm mt-1">Frame ready to share!</p>
          </div>,
          { duration: 4000 }
        )
      } else {
        // Fallback if popup blocked
        await navigator.clipboard.writeText(`${defaultMessage}\n\n${frameUrl}`)
        toast.success(
          <div>
            <p><strong>Frame URL copied!</strong></p>
            <p className="text-sm mt-1">Open Warpcast and paste to share</p>
          </div>, 
          { duration: 6000 }
        )
      }
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
      // If clipboard fails too, show the URL in a modal or alert
      console.error('❌ Clipboard also failed:', clipboardError)
      
      // Last resort: show frame URL in alert
      const message = `Share this interactive trading frame:\n\n${defaultMessage}\n\n${frameUrl}`
      
      if (typeof window !== 'undefined') {
        // Try to create a custom modal if possible
        const modal = document.createElement('div')
        modal.style.cssText = `
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8); z-index: 10000;
          display: flex; align-items: center; justify-content: center;
          color: white; font-family: system-ui;
        `
        modal.innerHTML = `
          <div style="background: #1f2937; padding: 24px; border-radius: 12px; max-width: 400px; margin: 20px;">
            <h3 style="margin: 0 0 16px 0;">Share Frame URL</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px;">${defaultMessage}</p>
            <input type="text" value="${frameUrl}" readonly style="width: 100%; padding: 8px; background: #374151; border: 1px solid #6b7280; border-radius: 6px; color: white; margin-bottom: 16px;">
            <div style="display: flex; gap: 8px;">
              <button onclick="navigator.clipboard.writeText('${frameUrl}').then(() => alert('Copied!')).catch(() => {})" style="flex: 1; padding: 8px; background: #8b5cf6; border: none; border-radius: 6px; color: white; cursor: pointer;">Copy URL</button>
              <button onclick="this.closest('div').parentElement.remove()" style="flex: 1; padding: 8px; background: #6b7280; border: none; border-radius: 6px; color: white; cursor: pointer;">Close</button>
            </div>
          </div>
        `
        document.body.appendChild(modal)
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
          if (modal.parentElement) {
            modal.remove()
          }
        }, 10000)
      } else {
        // Server-side or no DOM - just log
        console.log('📋 Frame URL to share:', frameUrl)
      }
      
      toast.error(
        <div>
          <p><strong>Share failed</strong></p>
          <p className="text-sm mt-1">Check console for frame URL</p>
        </div>,
        { duration: 5000 }
      )
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

// Helper function to get frame metadata for preview
export const getFrameMetadata = async (frameUrl: string) => {
  try {
    const response = await fetch(frameUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Farcaster Frame Bot 1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract basic metadata using regex (simple parsing)
    const titleMatch = html.match(/<meta property="og:title" content="([^"]*)"/)
    const descMatch = html.match(/<meta property="og:description" content="([^"]*)"/)
    const imageMatch = html.match(/<meta property="fc:frame:image" content="([^"]*)"/)
    const postUrlMatch = html.match(/<meta property="fc:frame:post_url" content="([^"]*)"/)
    
    return {
      title: titleMatch?.[1] || 'Creator Coin Frame',
      description: descMatch?.[1] || 'Trade Creator Coins directly in Farcaster',
      image: imageMatch?.[1] || null,
      postUrl: postUrlMatch?.[1] || frameUrl,
      isValid: !!(titleMatch && imageMatch),
      hasButtons: html.includes('fc:frame:button:1'),
      hasInput: html.includes('fc:frame:input:text')
    }
  } catch (error) {
    console.error('❌ Failed to fetch frame metadata:', error)
    return {
      title: 'Creator Coin Frame',
      description: 'Trade Creator Coins directly in Farcaster',
      image: null,
      postUrl: frameUrl,
      isValid: false,
      hasButtons: false,
      hasInput: false
    }
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

// Utility to detect if we're in different Farcaster contexts
export const detectFarcasterContext = () => {
  if (typeof window === 'undefined') return 'server'
  
  const hostname = window.location.hostname
  const userAgent = navigator.userAgent
  const hasAPI = !!(window as any).farcaster
  const isFrame = window !== window.parent
  
  if (hostname.includes('warpcast')) return 'warpcast'
  if (hostname.includes('farcaster')) return 'farcaster-app'
  if (userAgent.includes('Farcaster')) return 'farcaster-mobile'
  if (hasAPI) return 'farcaster-with-api'
  if (isFrame) return 'iframe-miniapp'
  
  return 'external'
}