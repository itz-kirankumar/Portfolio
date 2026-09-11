'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveSection } from '../actions'
import { SECTION_SCHEMAS } from '@/lib/site-schema'
import type { SectionKey } from '@/types/site'
import AutoForm from './AutoForm'

export default function EditorForm({ section, initialData }: { section: string; initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveSection(section, data)
      if (res.ok === false) {
        setError(res.error + (res.issues ? '\n' + res.issues.join('\n') : ''))
      } else {
        useToast.getState().toast('Saved successfully!')
        router.refresh()
      }
    } catch (e: any) {
      setError('Error saving: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const schema = SECTION_SCHEMAS[section as SectionKey]

  if (!schema) {
    return <div className="text-red-500">Invalid section schema</div>
  }

  return (
    <AutoForm 
      schema={schema} 
      initialData={initialData} 
      onSave={handleSave} 
      loading={loading} 
      error={error} 
    />
  )
}

