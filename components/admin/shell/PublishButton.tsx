'use client'
import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { BTN } from '@/components/admin/ui'
import { publishSite } from '@/app/admin/actions'
import { useUI as useToast } from '@/lib/store/ui'

export function PublishButton() {
  const [busy, setBusy] = useState(false)

  return (
    <button
      type="button"
      disabled={busy}
      className={`${BTN} px-2.5 ${busy ? 'opacity-50' : ''}`}
      onClick={async () => {
        setBusy(true)
        const res = await publishSite()
        if (!res.ok) {
          useToast.getState().toast('Failed to publish site: ' + (res as any).error)
        } else {
          useToast.getState().toast('Site published successfully!')
        }
        setBusy(false)
      }}
    >
      <UploadCloud className="size-3.5" />
      <span className="hidden sm:inline">{busy ? 'Publishing...' : 'Publish Drafts'}</span>
    </button>
  )
}
