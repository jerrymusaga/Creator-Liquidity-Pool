// components/social/SocialFeatures.tsx
'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, MessageCircle, Share, UserPlus, UserCheck,
  MoreVertical, Flag, Copy, ExternalLink, Send,
  Smile, Image, Gift, Zap, Crown, Verified
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWallet } from '@/hooks/useWallet'
import { CoinComment, User } from '@/types'
import toast from 'react-hot-toast'

interface SocialFeaturesProps {
  coinAddress: string
  creator?: User
  className?: string
}

export const SocialFeatures: React.FC<SocialFeaturesProps> = ({ 
  coinAddress, 
  creator,
  className = "" 
}) => {
  const { isConnected, address } = useWallet()
  const [isFollowing, setIsFollowing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [likes, setLikes] = useState(Math.floor(Math.random() * 100) + 20)
  const [isLiked, setIsLiked] = useState(false)

  // Mock comments data
  const [comments, setComments] = useState<CoinComment[]>([
    {
      id: '1',
      coinAddress,
      userId: '1',
      user: {
        id: '1',
        username: 'cryptofan_99',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cryptofan99',
        isCreator: false,
        verificationStatus: 'unverified',
      },
      content: 'This creator coin is going to the moon! 🚀 Great project!',
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      likes: 12,
    },
    {
      id: '2',
      coinAddress,
      userId: '2',
      user: {
        id: '2',
        username: 'nft_collector',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nftcollector',
        isCreator: true,
        verificationStatus: 'verified',
      },
      content: 'Love the community building around this coin. The utility looks promising!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likes: 8,
    },
  ])

  const handleFollow = async () => {
    if (!isConnected) {
      toast.error('Connect wallet to follow creators')
      return
    }

    setIsFollowing(!isFollowing)
    
    if (!isFollowing) {
      toast.success(`Following ${creator?.username || 'creator'}!`, {
        icon: '👤',
        style: {
          background: '#1F2937',
          color: '#F3F4F6',
          border: '1px solid #8B5CF6',
        },
      })
    } else {
      toast.success(`Unfollowed ${creator?.username || 'creator'}`)
    }
  }

  const handleLike = () => {
    if (!isConnected) {
      toast.error('Connect wallet to like')
      return
    }

    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleShare = async () => {
    const shareText = `Check out ${creator?.username || 'this creator'}'s coin on VibeStream! 🚀`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creator?.username || 'Creator'} on VibeStream`,
          text: shareText,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleComment = () => {
    if (!isConnected) {
      toast.error('Connect wallet to comment')
      return
    }

    if (!newComment.trim()) return

    const comment: CoinComment = {
      id: Date.now().toString(),
      coinAddress,
      userId: address || 'anonymous',
      user: {
        id: address || 'anonymous',
        username: `${address?.slice(0, 6)}...${address?.slice(-4)}` || 'Anonymous',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`,
        isCreator: false,
        verificationStatus: 'unverified',
      },
      content: newComment,
      createdAt: new Date(),
      likes: 0,
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
    
    toast.success('Comment posted!', {
      icon: '💬',
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMins > 0) return `${diffMins}m ago`
    return 'Just now'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Creator Info & Follow */}
      {creator && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={creator.avatar}
                alt={creator.username}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{creator.username}</h3>
                  {creator.verificationStatus === 'verified' && (
                    <Verified className="w-4 h-4 text-blue-400" />
                  )}
                  {creator.isCreator && (
                    <Crown className="w-4 h-4 text-vibe-purple" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {creator.followers?.toLocaleString() || '0'} followers
                </p>
                {creator.bio && (
                  <p className="text-sm text-gray-300 mt-1">{creator.bio}</p>
                )}
              </div>
            </div>
            
            <Button
              onClick={handleFollow}
              disabled={!isConnected}
              variant={isFollowing ? "outline" : "primary"}
              size="sm"
              className={isFollowing ? "border-vibe-purple text-vibe-purple" : ""}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Social Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={!isConnected}
              className={`flex items-center space-x-2 transition-colors ${
                isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <Share className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Gift className="w-4 h-4 mr-2" />
              Tip Creator
            </Button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Add Comment */}
            {isConnected && (
              <Card className="p-4">
                <div className="flex space-x-3">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-vibe-purple"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Smile className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-white transition-colors">
                          <Image className="w-4 h-4" />
                        </button>
                      </div>
                      <Button
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex space-x-3">
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{comment.user.username}</span>
                        {comment.user.verificationStatus === 'verified' && (
                          <Verified className="w-3 h-3 text-blue-400" />
                        )}
                        {comment.user.isCreator && (
                          <Crown className="w-3 h-3 text-vibe-purple" />
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-2">{comment.content}</p>
                      <div className="flex items-center space-x-4 text-xs">
                        <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                          <Heart className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          Reply
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {comments.length === 0 && (
              <Card className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No comments yet</h3>
                <p className="text-sm text-gray-400">
                  Be the first to share your thoughts about this creator coin!
                </p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}