'use client'
// components/blocks/ContactBlock.tsx
import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactBlock() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to your backend later
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="bg-[#13131a] border border-white/[0.08] rounded-3xl p-10 md:p-16">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-syne text-4xl font-bold text-white mb-4">Let's Work Together</h2>
        <p className="text-white/60 text-lg mb-10">
          Have a project in mind? I'm currently available for new opportunities.
        </p>

        {submitted ? (
          <div className="py-12 text-[#7ef0c8] text-xl font-medium">
            Thank you! I'll get back to you soon ✨
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:border-[#7ef0c8]"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:border-[#7ef0c8]"
              required
            />
            <textarea
              placeholder="Tell me about your project..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:border-[#7ef0c8] resize-y"
              required
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#7ef0c8] text-black font-semibold rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3"
            >
              Send Message <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}