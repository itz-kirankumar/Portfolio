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
    
    const res = await likeComment(c.id, postId)
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
    if (!replyText.trim()) return
    setLoading(true)
    
    const newReply = { 
      id: Date.now().toString(), 
      postId, 
      parentId: c.id,
      name: replyName.trim() || 'Anonymous', 
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
            <form data-clarity-mask="true" onSubmit={submitReply} className="mt-4 bg-paper-deep/50 p-4 rounded-lg border border-rule animate-in fade-in slide-in-from-top-2">
              <div className="mb-3">
                <input 
                  type="text" 
                  required 
                  value={replyName}
                  onChange={e => setReplyName(e.target.value)}
                  className="w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-coral focus:outline-none"
                  placeholder="Name (optional - posts as Anonymous)"
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
    if (!text.trim()) return
    setLoading(true)
    
    const newComment = { 
      id: Date.now().toString(), 
      postId, 
      name: name.trim() || 'Anonymous', 
      text, 
      createdAt: Date.now(), 
      status: 'approved' as const,
      likes: 0
    }
    
    setComments([newComment, ...comments])
    setName('')
    setText('')
    setComposerOpen(false)
    
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

  const [composerOpen, setComposerOpen] = useState(false)

  return (
    <div className="mt-16 text-left" id="comments">
      <h3 className="font-display text-2xl font-bold text-ink mb-6">Responses{comments.length > 0 ? ` (${comments.length})` : ''}</h3>

      {/* Progressive composer: one calm line that expands when engaged. */}
      <form
        data-clarity-mask="true"
        onSubmit={handleSubmit}
        className={`mb-8 rounded-2xl border bg-card transition-all duration-300 ${composerOpen || text ? 'border-coral/40 p-4 sm:p-5' : 'border-rule p-3 sm:p-4'}`}
      >
        <textarea
          required
          value={text}
          onFocus={() => setComposerOpen(true)}
          onChange={e => setText(e.target.value)}
          rows={composerOpen || text ? 3 : 1}
          className="w-full resize-y rounded-lg border border-rule bg-paper px-4 py-2.5 text-ink focus:border-coral focus:outline-none transition-all placeholder:text-ink-soft/60"
          placeholder="Share your thoughts…"
        />
        {(composerOpen || text) && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center animate-in fade-in slide-in-from-top-1">
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full sm:max-w-[16rem] rounded-lg border border-rule bg-paper px-4 py-2 text-sm text-ink focus:border-coral focus:outline-none placeholder:text-ink-soft/60"
              placeholder="Name (or stay Anonymous)"
            />
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => { setComposerOpen(false); setText(''); }}
                className="px-3 py-2 text-xs font-medium text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-coral px-5 py-2 text-sm font-medium text-white transition hover:bg-coral-deep disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Post'}
              </button>
            </div>
          </div>
        )}
      </form>

      {rootComments.length > 0 ? (
        <div className="bg-card rounded-2xl border border-rule p-5 sm:p-6">
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
        <p className="flex items-center gap-2 text-sm text-ink-soft/70">
          <MessageCircle className="size-4" />
          No responses yet - yours could be the first.
        </p>
      )}
    </div>
  )
}