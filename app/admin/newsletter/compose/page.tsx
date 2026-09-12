'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader, SaveBar, Field, Input, Panel } from '@/components/admin/ui'
import { Tiptap } from '@/app/admin/publishing/[id]/Tiptap'
import { sendNewsletter } from './actions'
import { useUI as useToast } from '@/lib/store/ui'

export default function ComposeNewsletterPage() {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [doc, setDoc] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!subject.trim() || !html.trim()) {
      setError('Subject and content are required')
      return
    }

    setSending(true)
    setError(null)
    try {
      const res = await sendNewsletter(subject, html)
      if (res.ok) {
        useToast.getState().toast(`Newsletter sent to ${res.count} subscribers!`)
        router.push('/admin/newsletter')
      } else {
        setError(res.error)
      }
    } catch (e: any) {
      setError('Error sending newsletter: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Compose Newsletter"
        description="Draft and send an email to all active subscribers."
      />

      <div className="mt-6 space-y-6 pb-24">
        <Panel title="Email Details">
          <Field label="Subject Line">
            <Input 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. October Updates & New Services"
            />
          </Field>
        </Panel>

        <Panel title="Content">
          <Tiptap 
            initialContent=""
            onChange={(h, d) => {
              setHtml(h)
              setDoc(d)
            }}
          />
        </Panel>
      </div>

      <SaveBar
        dirty={subject.length > 0 || html.length > 0}
        saving={sending}
        onSave={handleSend}
        onReset={() => router.push('/admin/newsletter')}
        error={error}
        saveLabel="Send Newsletter"
        resetLabel="Cancel"
      />
    </>
  )
}
