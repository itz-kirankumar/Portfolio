'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUI } from '@/lib/store/ui'
import { saveMedia } from '@/app/admin/media/actions'
import { processAndUploadMediaFile } from '@/app/admin/media/upload-helper'
import { Loader2 } from 'lucide-react'

export default function MediaDropzone({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadText, setUploadText] = useState('')
  const router = useRouter()
  
  const dragCounter = useRef(0)

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setIsUploading(true)
    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setUploadText(`Uploading ${i + 1} of ${files.length}...`)
      try {
        const payload = await processAndUploadMediaFile(file)
        
        // Save to DB
        const res = await saveMedia(null, {
          ...payload,
          caption: '',
          alt: '',
          tags: [],
          featured: false,
          width: 0,
          height: 0,
          authorName: '',
        })
        
        if (res.ok) {
          successCount++
        } else {
          console.error('Failed to save media document', res)
        }
      } catch (err: any) {
        useUI.getState().toast(`Failed to upload ${file.name}: ${err.message}`)
      }
    }

    setIsUploading(false)
    setUploadText('')
    
    if (successCount > 0) {
      useUI.getState().toast(`Successfully uploaded ${successCount} file(s)`)
      router.refresh()
    }
  }

  return (
    <div 
      className="relative min-h-[calc(100vh-120px)]"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {children}
      
      {isDragging && !isUploading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-stone-100/80 backdrop-blur-sm border-2 border-dashed border-stone-400 rounded-xl pointer-events-none">
          <div className="text-xl font-semibold text-stone-600">
            Drop files here to upload to Media Library
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-100/80 backdrop-blur-sm rounded-xl">
          <Loader2 className="size-10 animate-spin text-stone-600 mb-4" />
          <div className="text-lg font-medium text-stone-700">{uploadText}</div>
        </div>
      )}
    </div>
  )
}
