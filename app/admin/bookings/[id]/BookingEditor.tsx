'use client'
import { useUI as useToast } from '@/lib/store/ui'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveBooking, deleteBooking, resendInvite } from '../actions'
import { bookingSchema } from '@/lib/schemas/booking'
import AutoForm from '@/app/admin/[section]/AutoForm'

export default function BookingEditor({ id, initialData }: { id: string, initialData: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSave = async (data: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await saveBooking(id, data)
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
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    setLoading(true)
    try {
      const res = await deleteBooking(id)
      if (res.ok) {
        router.push('/admin/bookings')
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
        schema={bookingSchema} 
        initialData={initialData} 
        onSave={handleSave} 
        loading={loading} 
        error={error} 
      />
      {initialData?.status === 'confirmed' && initialData?.inviteStatus === 'failed' && (
        <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[0.85rem] text-amber-900">
            This booking is paid and confirmed, but its calendar invite failed
            {initialData?.inviteError ? `: ${initialData.inviteError}` : '.'} The guest has no Meet link yet.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={async () => {
              setLoading(true)
              setError(null)
              const res = await resendInvite(id)
              setLoading(false)
              if (res.ok) {
                useToast.getState().toast('Invite sent')
                router.refresh()
              } else {
                setError(res.error || 'Failed to send invite')
              }
            }}
            className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-[0.82rem] font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Resend invite
          </button>
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-red-100 flex justify-end">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
        >
          Delete Booking
        </button>
      </div>
    </div>
  )
}
