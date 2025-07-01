import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Share, Copy, ExternalLink, TrendingUp, Zap, 
  Users, Coins, Play, Fire, Crown, ArrowUp, ArrowDown
} from 'lucide-react'
import { CreatorCoin, ContentCoin, Economy } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import toast from 'react-hot-toast'

// Creator Coin Trading Frame
export const CreatorCoinFrame: React.FC<{
  economy: Economy
  onBuy?: (amount: number) => void
  onViewEconomy?: () => void
}> = ({ economy, onBuy, onViewEconomy }) => {
  const [buyAmount, setBuyAmount] = useState(0.01)
  const coin = economy.creatorCoin
  const isPositive = coin.priceChange24h >= 0
  const estimatedCoins = buyAmount / coin.currentPrice

  const handleShare = () => {
    const frameData = {
      image: coin.image,
      title: `${coin.name} - $${coin.symbol}`,
      description: `Trade ${economy.creator.username}'s Creator Coin • V4 Auto Rewards`,
      buttons: [
        { text: `Buy $${coin.symbol}`, action: 'tx' },
        { text: 'View Economy', action: 'link' },
        { text: 'Share Frame', action: 'post' }
      ],
      metadata: {
        price: coin.currentPrice,
        change24h: coin.priceChange24h,
        volume24h: coin.volume24h,
        holders: coin.holderCount,
        v4Rewards: true
      }
    }

    // In real implementation, this would generate actual Farcaster Frame
    const shareText = `🚀 ${economy.creator.username}'s Creator Coin is live!\n\n💰 Price: $${coin.currentPrice.toFixed(4)}\n📈 24h: ${isPositive ? '+' : ''}${coin.priceChange24h.toFixed(1)}%\n👥 ${coin.holderCount} holders\n⚡ V4 Auto Rewards\n\nTrade now:`

    if (navigator.share) {
      navigator.share({
        title: `${coin.name} on Vibe`,
        text: shareText,
        url: `https://vibe.app/coin/${coin.address}`
      })
    } else {
      navigator.clipboard.writeText(`${shareText}\nhttps://vibe.app/coin/${coin.address}`)
      toast.success('Frame link copied! Share on Farcaster')
    }
  }

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Frame Header */}
      <div className="relative h-48 bg-gradient-to-br from-vibe-purple to-vibe-blue">
        <img
          src={coin.image}
          alt={coin.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        
        {/* Overlay Content */}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4">
          {/* Top: Badge and Price */}
          <div className="flex items-start justify-between">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
              <span className="text-xs text-vibe-green font-medium">V4 Auto Rewards</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">${coin.currentPrice.toFixed(4)}</p>
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {Math.abs(coin.priceChange24h).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Bottom: Creator Info */}
          <div className="flex items-center space-x-3">
            <img
              src={economy.creator.avatar}
              alt={economy.creator.username}
              className="w-12 h-12 rounded-full border-2 border-white/50"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{coin.name}</h3>
              <p className="text-sm text-gray-200">by {economy.creator.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Body */}
      <div className="p-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-vibe-blue mr-1" />
              <span className="text-xs text-gray-400">Holders</span>
            </div>
            <p className="font-semibold">{coin.holderCount}</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-vibe-green mr-1" />
              <span className="text-xs text-gray-400">Volume</span>
            </div>
            <p className="font-semibold">${(coin.volume24h / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-1">
              <Play className="w-4 h-4 text-vibe-pink mr-1" />
              <span className="text-xs text-gray-400">Content</span>
            </div>
            <p className="font-semibold">{economy.contentCoins.length}</p>
          </div>
        </div>

        {/* Quick Buy */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Quick Buy</span>
            <span className="text-sm text-gray-300">≈ {estimatedCoins.toFixed(0)} ${coin.symbol}</span>
          </div>
          <div className="flex space-x-2 mb-3">
            {[0.01, 0.05, 0.1].map((amount) => (
              <button
                key={amount}
                onClick={() => setBuyAmount(amount)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                  buyAmount === amount
                    ? 'bg-vibe-purple text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {amount} ETH
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Creator earns 50% of fees automatically in ZORA
          </p>
        </div>

        {/* Frame Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onBuy && onBuy(buyAmount)}
            size="sm"
            className="text-xs"
          >
            Buy Now
          </Button>
          <Button
            onClick={onViewEconomy}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Economy
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Share className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Content Coin Speculation Frame
export const ContentCoinFrame: React.FC<{
  contentCoin: ContentCoin
  onTrade?: (amount: number) => void
}> = ({ contentCoin, onTrade }) => {
  const [tradeAmount, setTradeAmount] = useState(0.005)
  const isPositive = contentCoin.priceChange24h >= 0

  const getContentIcon = () => {
    switch (contentCoin.properties.contentType) {
      case 'video': return '🎥'
      case 'meme': return '😂'
      case 'music': return '🎵'
      case 'image': return '🖼️'
      default: return '📄'
    }
  }

  const getSentimentEmoji = () => {
    switch (contentCoin.speculationSentiment) {
      case 'bullish': return '🚀'
      case 'bearish': return '📉'
      default: return '🤔'
    }
  }

  const handleShare = () => {
    const shareText = `${getSentimentEmoji()} ${contentCoin.name} is ${contentCoin.speculationSentiment}!\n\n${getContentIcon()} ${contentCoin.properties.contentType} by ${contentCoin.parentCreator.username}\n💰 ${contentCoin.currentPrice.toFixed(3)} ${contentCoin.symbol}\n🔥 Viral Score: ${contentCoin.viralityScore}/100\n⚡ Multi-hop rewards\n\nSpeculate now:`

    if (navigator.share) {
      navigator.share({
        title: `${contentCoin.name} - Content Speculation`,
        text: shareText,
        url: `https://vibe.app/content/${contentCoin.address}`
      })
    } else {
      navigator.clipboard.writeText(`${shareText}\nhttps://vibe.app/content/${contentCoin.address}`)
      toast.success('Content frame copied! Share on Farcaster')
    }
  }

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Frame Header */}
      <div className="relative h-48">
        <img
          src={contentCoin.thumbnailURI || contentCoin.image}
          alt={contentCoin.name}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-xs text-white font-medium">
                {getContentIcon()} {contentCoin.properties.contentType}
              </span>
            </div>
            {contentCoin.viralityScore > 80 && (
              <div className="bg-orange-500/80 backdrop-blur-sm rounded-lg px-2 py-1">
                <span className="text-xs text-white font-bold">🔥 HOT</span>
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{contentCoin.name}</h3>
                <p className="text-sm text-gray-200">by {contentCoin.parentCreator.username}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">${contentCoin.currentPrice.toFixed(3)}</p>
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {Math.abs(contentCoin.priceChange24h).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Body */}
      <div className="p-4 space-y-4">
        {/* Speculation Metrics */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Market Sentiment</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              contentCoin.speculationSentiment === 'bullish' ? 'bg-green-500/20 text-green-400' :
              contentCoin.speculationSentiment === 'bearish' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {getSentimentEmoji()} {contentCoin.speculationSentiment}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-sm text-gray-400">Viral Score</p>
              <p className="font-semibold">{contentCoin.viralityScore}/100</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Volume</p>
              <p className="font-semibold">${(contentCoin.volume24h / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>

        {/* Multi-hop Path */}
        <div className="bg-vibe-purple/10 border border-vibe-purple/20 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <Zap className="w-4 h-4 text-vibe-purple mr-2" />
            <span className="text-sm font-medium text-vibe-purple">Multi-Hop Rewards</span>
          </div>
          <div className="text-xs text-gray-400">
            {contentCoin.symbol} → {contentCoin.parentCreator.username} → ZORA
          </div>
        </div>

        {/* Quick Trade */}
        <div className="flex space-x-2">
          {[0.005, 0.01, 0.02].map((amount) => (
            <button
              key={amount}
              onClick={() => setTradeAmount(amount)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                tradeAmount === amount
                  ? 'bg-vibe-pink text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {amount} ETH
            </button>
          ))}
        </div>

        {/* Frame Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onTrade && onTrade(tradeAmount)}
            size="sm"
            className="text-xs bg-vibe-pink hover:bg-vibe-pink/90"
          >
            Speculate
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
          >
            View Creator
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Share className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Culture Index Leaderboard Frame
export const CultureIndexFrame: React.FC<{
  topEconomies: Economy[]
}> = ({ topEconomies }) => {
  const handleShare = () => {
    const shareText = `🏆 Culture Index - Top Creator Coins\n\n${topEconomies.slice(0, 3).map((economy, i) => 
      `${i + 1}. ${economy.creator.username} ($${economy.creatorCoin.symbol}) - ${economy.cultureScore} pts`
    ).join('\n')}\n\nDiscover the hottest creator economies:`

    if (navigator.share) {
      navigator.share({
        title: 'Culture Index - Vibe',
        text: shareText,
        url: 'https://vibe.app/culture'
      })
    } else {
      navigator.clipboard.writeText(`${shareText}\nhttps://vibe.app/culture`)
      toast.success('Culture Index frame copied!')
    }
  }

  const getTrophyEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <Card className="max-w-md mx-auto overflow-hidden">
      {/* Frame Header */}
      <div className="bg-gradient-to-r from-vibe-purple to-vibe-pink p-6 text-center">
        <Crown className="w-12 h-12 text-white mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-white">Culture Index</h2>
        <p className="text-sm text-gray-200">Top Creator Economies</p>
      </div>

      {/* Frame Body */}
      <div className="p-4 space-y-3">
        {topEconomies.slice(0, 5).map((economy, index) => (
          <div
            key={economy.id}
            className={`flex items-center space-x-3 p-3 rounded-lg ${
              index < 3 ? 'bg-gradient-card' : 'bg-gray-800'
            }`}
          >
            <div className="text-xl font-bold w-8 text-center">
              {getTrophyEmoji(index + 1)}
            </div>
            <img
              src={economy.creator.avatar}
              alt={economy.creator.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{economy.creator.username}</h4>
              <p className="text-sm text-gray-400">${economy.creatorCoin.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-vibe-purple">{economy.cultureScore}</p>
              <p className="text-xs text-gray-400">${(economy.creatorCoin.volume24h / 1000).toFixed(1)}K</p>
            </div>
          </div>
        ))}

        {/* Frame Actions */}
        <div className="pt-4 space-y-2">
          <Button className="w-full" size="sm">
            View Full Rankings
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Share className="w-4 h-4 mr-2" />
            Share Culture Index
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Frame Generator Utilities
export const generateFrameMetadata = (type: 'creator' | 'content' | 'culture', data: any) => {
  const baseUrl = 'https://vibe.app'
  
  switch (type) {
    case 'creator':
      return {
        'fc:frame': 'vNext',
        'fc:frame:image': `${baseUrl}/api/frames/creator/${data.address}/image`,
        'fc:frame:button:1': `Buy $${data.symbol}`,
        'fc:frame:button:1:action': 'tx',
        'fc:frame:button:1:target': `${baseUrl}/api/frames/creator/${data.address}/buy`,
        'fc:frame:button:2': 'View Economy',
        'fc:frame:button:2:action': 'link',
        'fc:frame:button:2:target': `${baseUrl}/economy/${data.address}`,
        'fc:frame:button:3': 'Share',
        'fc:frame:button:3:action': 'post',
        'fc:frame:post_url': `${baseUrl}/api/frames/creator/${data.address}/share`,
        'og:title': `${data.name} - Creator Coin`,
        'og:description': `Trade ${data.creator.username}'s Creator Coin with V4 Auto Rewards`,
        'og:image': data.image
      }
    
    case 'content':
      return {
        'fc:frame': 'vNext',
        'fc:frame:image': `${baseUrl}/api/frames/content/${data.address}/image`,
        'fc:frame:button:1': 'Speculate',
        'fc:frame:button:1:action': 'tx',
        'fc:frame:button:1:target': `${baseUrl}/api/frames/content/${data.address}/trade`,
        'fc:frame:button:2': 'View Creator',
        'fc:frame:button:2:action': 'link',
        'fc:frame:button:2:target': `${baseUrl}/creator/${data.parentCreator.id}`,
        'fc:frame:button:3': 'Share',
        'fc:frame:button:3:action': 'post',
        'fc:frame:post_url': `${baseUrl}/api/frames/content/${data.address}/share`,
        'og:title': `${data.name} - Content Speculation`,
        'og:description': `${data.properties.contentType} by ${data.parentCreator.username} • Viral Score: ${data.viralityScore}/100`,
        'og:image': data.thumbnailURI || data.image
      }
      
    case 'culture':
      return {
        'fc:frame': 'vNext',
        'fc:frame:image': `${baseUrl}/api/frames/culture/image`,
        'fc:frame:button:1': 'View Rankings',
        'fc:frame:button:1:action': 'link',
        'fc:frame:button:1:target': `${baseUrl}/culture`,
        'fc:frame:button:2': 'Discover Creators',
        'fc:frame:button:2:action': 'link',
        'fc:frame:button:2:target': `${baseUrl}/creators`,
        'fc:frame:button:3': 'Share',
        'fc:frame:button:3:action': 'post',
        'fc:frame:post_url': `${baseUrl}/api/frames/culture/share`,
        'og:title': 'Culture Index - Top Creator Coins',
        'og:description': 'Discover the hottest creator economies ranked by community engagement',
        'og:image': `${baseUrl}/api/frames/culture/image`
      }
      
    default:
      return {}
  }
}