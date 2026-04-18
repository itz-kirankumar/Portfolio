'use client'
// hooks/useProfile.ts
import { useEffect } from 'react'
import { usePortfolioStore } from '@/store/portfolioStore'

export function useProfile() {
  const { profile, setProfile, setLoading, loading } = usePortfolioStore()

  useEffect(() => {
    // Only fetch if profile isn't already in the store
    if (!profile && !loading) {
      setLoading(true)
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) setProfile(data.profile)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load profile:", err)
          setLoading(false)
        })
    }
  }, [profile, setProfile, setLoading, loading])

  return { profile, loading }
}