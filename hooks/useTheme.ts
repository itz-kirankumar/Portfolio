'use client'
// hooks/useTheme.ts
import { usePortfolioStore } from '@/store/portfolioStore'
import type { PortfolioTheme } from '@/types'

export function useTheme() {
  const profile = usePortfolioStore((state) => state.profile)
  
  // Create a fallback theme that strictly matches the PortfolioTheme interface
  const defaultTheme: PortfolioTheme = {
    preset: 'Dark Mint',
    primaryColor: '#7ef0c8',
    accentColor: '#818cf8',
    bgColor: '#0a0a0f',
    surfaceColor: '#13131a',
    textColor: '#e8e6e0',
    headingFont: 'Syne',
    bodyFont: 'DM Sans',
    borderRadius: 'lg',
    darkMode: true, // This was missing in your error screenshot
  }

  const theme = profile?.theme || defaultTheme

  return { theme, isDark: theme.darkMode }
}