'use client'

import { useState } from 'react'
import { postComment } from '@/app/writing/actions'
import type { Comment } from '@/lib/schemas/comment'
import { Loader2 } from 'lucide-react'

export function CommentsList({ postId, initialComments = [] }: { postId: string, initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setLoading(true)
    
    // Optimistic
    const newComment = { id: Date.now().toString(), postId, name, text, createdAt: Date.now(), status: 'approved' as const }
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

  return (
    <div className="mt-16 text-left" id="comments">
      <h3 className="font-display text-2xl font-bold text-ink mb-8">Comments ({comments.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-12 bg-paper-deep/30 p-6 rounded-xl border border-rule">
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-soft mb-1">Your Name</label>
          <input 
            type="text" 
            required 
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-md border border-rule bg-paper px-4 py-2 text-ink focus:border-coral focus:outline-none"
            placeholder="Anonymous"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-soft mb-1">Comment</label>
          <textarea 
            required 
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full rounded-md border border-rule bg-paper px-4 py-3 text-ink focus:border-coral focus:outline-none min-h-[100px]"
            placeholder="Share your thoughts..."
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="rounded-full bg-coral px-6 py-2.5 text-sm font-medium text-white transition hover:bg-coral-deep disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-8">
        {comments.map(c => (
          <div key={c.id} className="border-b border-rule pb-8 last:border-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-10 rounded-full bg-paper-deep flex items-center justify-center font-bold text-ink border border-rule">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-ink">{c.name}</p>
                <p className="text-[0.75rem] text-ink-soft font-mono uppercase tracking-wider">
                  {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-ink-soft leading-relaxed mt-3 whitespace-pre-wrap">{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-ink-soft text-center py-8">Be the first to comment.</p>
        )}
      </div>
    </div>
  )
}
