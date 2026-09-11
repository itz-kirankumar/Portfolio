'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMedia, deleteMedia } from '../actions'
import { mediaSchema } from '@/lib/schemas/media'
import AutoForm from '@/app/admin/[section]/AutoForm'

export default function MediaEditor({ initialData, id }: { initialData: any, id: string | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveMedia(id, data)
      if (res.ok === false) {
        setError(res.error + (res.issues ? '\n' + res.issues.join('\n') : ''))
      } else {
        useToast.getState().toast('Saved successfully!')
        router.push('/admin/media')
        router.refresh()
      }
    } catch (e: any) {
      setError('Error saving: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this media?')) return
    setLoading(true)
    try {
      const res = await deleteMedia(id)
      if (!res.ok) {
        setError(res.error || 'Failed to delete')
      } else {
        alert('Deleted successfully!')
        router.push('/admin/media')
        router.refresh()
      }
    } catch (e: any) {
      setError('Error deleting: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <AutoForm 
        schema={mediaSchema} 
        initialData={initialData} 
        onSave={handleSave} 
        loading={loading} 
        error={error} 
      />
      {id && (
        <div className="mt-8 pt-6 border-t border-red-100">
          <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
          <p className="text-stone-500 text-sm mb-4">Once you delete this media, there is no going back. Please be certain.</p>
          <button 
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-md hover:bg-red-100 disabled:opacity-50 transition border border-red-200"
          >
            Delete Media
          </button>
        </div>
      )}
    </div>
  )
}
