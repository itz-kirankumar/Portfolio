'use client'

import { useState, useEffect } from 'react'
import { postComment, postReply, likeComment } from '@/app/writing/actions'
import type { Comment } from '@/lib/schemas/comment'
import { Loader2, Heart, MessageCircle, Reply, Share } from 'lucide-react'

function CommentItem({ 
  c, 
  replies, 
  postId,
  onReplyAdded
}: { 
  c: Comment, 
  replies: Comment[], 
  postId: string,
  onReplyAdded: (reply: Comment) => void
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyName, setReplyName] = useState('')
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [likes, setLikes] = useState(c.likes || 0)
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    // Check local storage for like lock
    const liked = localStorage.getItem(`liked_comment_${c.id}`) === 'true'
    setHasLiked(liked)
  }, [c.id])

  const handleLike = async () => {
    if (hasLiked) return
    
    // Optimistic UI update
    setLikes(prev => prev + 1)
    setHasLiked(true)
    localStorage.setItem(`liked_comment_${c.id}`, 'true')
    
    const res = await likeComment(c.id)
    if (!res.ok) {
      // Revert if failed
      setLikes(prev => prev - 1)
      setHasLiked(false)
      localStorage.removeItem(`liked_comment_${c.id}`)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.href}#comment-${c.id}`)
      alert('Link copied to clipboard!')
    } catch (err) {}
  }

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyName.trim() || !replyText.trim()) return
    setLoading(true)
    
    const newReply = { 
      id: Date.now().toString(), 
      postId, 
      parentId: c.id,
      name: replyName, 
      text: replyText, 
      createdAt: Date.now(), 
      status: 'approved' as const,
      likes: 0
    }
    
    onReplyAdded(newReply)
    setIsReplying(false)
    setReplyName('')
    setReplyText('')
    
    await postReply(postId, c.id, newReply.name, newReply.text)
    setLoading(false)
  }

  return (
    <div className="border-b border-rule pb-6 mb-6 last:border-0 last:mb-0 last:pb-0" id={`comment-${c.id}`}>
      <div className="flex items-start gap-4">
        <div className="size-10 rounded-full bg-coral/10 text-coral flex-shrink-0 flex items-center justify-center font-bold font-display text-lg shadow-sm border border-coral/20">
          {c.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-ink truncate">{c.name}</h4>
            <span className="text-[0.7rem] text-ink-soft font-mono uppercase tracking-wider whitespace-nowrap">
              {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <p className="text-ink-soft leading-relaxed text-[0.95rem] whitespace-pre-wrap mb-3">{c.text}</p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-ink-soft">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${hasLiked ? 'text-coral' : 'hover:text-ink'}`}
            >
              <Heart className={`size-3.5 ${hasLiked ? 'fill-coral' : ''}`} />
              <span>{likes}</span>
            </button>
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 hover:text-ink transition-colors"
            >
              <MessageCircle className="size-3.5" />
              <span>Reply</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-ink transition-colors ml-auto"
            >
              <Share className="size-3.5" />
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <form onSubmit={submitReply} className="mt-4 bg-paper-deep/50 p-4 rounded-lg border border-rule animate-in fade-in slide-in-from-top-2">
              <div className="mb-3">
                <input 
                  type="text" 
                  required 
                  value={replyName}
                  onChange={e => setReplyName(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none"
                  placeholder="Your Name (Anonymous)"
                />
              </div>
              <div className="mb-3">
                <textarea 
                  required 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none min-h-[60px]"
                  placeholder="Write a reply..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="rounded-full bg-coral px-4 py-1.5 text-xs font-medium text-white transition hover:bg-coral-deep disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="size-3 animate-spin" /> : 'Reply'}
                </button>
              </div>
            </form>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="mt-6 space-y-6 pl-2 border-l-2 border-rule/50">
              {replies.map(reply => (
                <div key={reply.id} className="pl-4 relative">
                  <div className="absolute top-4 -left-2 w-4 h-px bg-rule/50" />
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-paper-deep flex-shrink-0 flex items-center justify-center font-bold font-display text-sm border border-rule">
                      {reply.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h5 className="font-medium text-sm text-ink truncate">{reply.name}</h5>
                        <span className="text-[0.65rem] text-ink-soft font-mono uppercase tracking-wider">
                          {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-ink-soft leading-relaxed text-sm whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function CommentsList({ postId, initialComments = [] }: { postId: string, initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setLoading(true)
    
    const newComment = { 
      id: Date.now().toString(), 
      postId, 
      name, 
      text, 
      createdAt: Date.now(), 
      status: 'approved' as const,
      likes: 0
    }
    
    setComments([newComment, ...comments])
    setName('')
    setText('')
    
    const res = await postComment(postId, newComment.name, newComment.text)
    if (!res.ok) {
      setComments(comments)
      alert(res.error || 'Failed to post comment')
    }
    setLoading(false)
  }

  const handleReplyAdded = (reply: Comment) => {
    setComments(prev => [...prev, reply])
  }

  // Separate root comments and replies
  const rootComments = comments.filter(c => !c.parentId).sort((a, b) => b.createdAt - a.createdAt)
  const allReplies = comments.filter(c => c.parentId)

  return (
    <div className="mt-16 text-left" id="comments">
      <h3 className="font-display text-2xl font-bold text-ink mb-8">Responses ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-12 bg-card p-6 sm:p-8 rounded-2xl border border-rule shadow-sm">
        <h4 className="font-semibold mb-4 text-ink">Join the conversation</h4>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <input 
              type="text" 
              required 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-rule bg-paper px-4 py-2.5 text-ink focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-shadow"
              placeholder="Your Name (Anonymous)"
            />
          </div>
          <div>
            <textarea 
              required 
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full rounded-lg border border-rule bg-paper px-4 py-3 text-ink focus:border-coral focus:ring-1 focus:ring-coral focus:outline-none transition-shadow min-h-[100px]"
              placeholder="What are your thoughts on this?"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="rounded-full bg-coral px-6 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-coral-deep disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Post Response'}
          </button>
        </div>
      </form>

      <div className="bg-card rounded-2xl border border-rule p-6 sm:p-8 shadow-sm">
        {rootComments.length > 0 ? (
          <div>
            {rootComments.map(c => (
              <CommentItem 
                key={c.id} 
                c={c} 
                postId={postId}
                replies={allReplies.filter(r => r.parentId === c.id).sort((a, b) => a.createdAt - b.createdAt)} 
                onReplyAdded={handleReplyAdded}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="size-12 text-rule mx-auto mb-4" />
            <p className="text-ink-soft">No responses yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  )
}