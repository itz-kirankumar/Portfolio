'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveTheme } from './actions'
import { themeSchema } from '@/lib/schemas/theme'
import AutoForm from '@/app/admin/[section]/AutoForm'
import { SaveBar } from '@/components/admin/ui'

export default function ThemeEditor({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveTheme(data)
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

  return (
    <AutoForm 
      schema={themeSchema} 
      initialData={initialData} 
      onSave={handleSave} 
      loading={loading} 
      error={error} 
    />
  )
}
