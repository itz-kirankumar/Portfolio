'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { BTN_PRIMARY } from '@/components/admin/ui'

export function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (e) {
      alert('Failed to export data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={loading} className={BTN_PRIMARY}>
      <Download className="size-4 mr-1.5" />
      {loading ? 'Exporting...' : 'Export JSON'}
    </button>
  )
}
