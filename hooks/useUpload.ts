'use client'
// hooks/useUpload.ts
import { useState } from 'react'

export function useUpload() {
  const [uploading, setUploading] = useState(false)

  const upload = async (file: File, folder: string = 'uploads') => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      return data.url as string
    } catch (err) {
      console.error('[Upload Hook] error:', err)
      return null
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading }
}