'use client'
// hooks/useBlocks.ts
import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'
import type { Block } from '@/types'

export function useBlocks() {
  const { blocks, setBlocks, loading, setLoading } = usePortfolioStore()

  useEffect(() => {
    const fetchBlocks = async () => {
      if (blocks.length > 0) return
      setLoading(true)
      try {
        const res = await fetch('/api/blocks')
        const data = await res.json()
        setBlocks(data.blocks || [])
      } catch (err) {
        console.error("Failed to load blocks", err)
      }
      setLoading(false)
    }
    fetchBlocks()
  }, [blocks.length, setBlocks, setLoading])

  return { blocks, loading }
}