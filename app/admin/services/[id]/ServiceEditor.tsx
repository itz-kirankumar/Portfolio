'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveService, deleteService } from '../actions'
import { serviceSchema } from '@/lib/schemas/service'
import AutoForm from '@/app/admin/[section]/AutoForm'

export default function ServiceEditor({ id, initialData }: { id: string, initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveService(id, data)
      if (res.ok === false) {
        setError(res.error + (res.issues ? '\n' + res.issues.join('\n') : ''))
      } else {
        useToast.getState().toast('Saved successfully!')
        if (id === 'new') {
          router.push(`/admin/services/${res.id}`)
        } else {
          router.refresh()
        }
      }
    } catch (e: any) {
      setError('Error saving: ' + e.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) return
    setLoading(true)
    try {
      const res = await deleteService(id)
      if (res.ok) {
        router.push('/admin/services')
      } else {
        setError(res.error || 'Failed to delete')
        setLoading(false)
      }
    } catch (e: any) {
      setError('Error deleting: ' + e.message)
      setLoading(false)
    }
  }

  return (
    <div>
      <AutoForm 
        schema={serviceSchema} 
        initialData={initialData} 
        onSave={handleSave} 
        loading={loading} 
        error={error} 
      />
      {id !== 'new' && (
        <div className="mt-8 pt-6 border-t border-red-100 flex justify-end">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            Delete Service
          </button>
        </div>
      )}
    </div>
  )
}
