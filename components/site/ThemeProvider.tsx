'use client'

import { useEffect } from 'react'
import { Theme } from '@/lib/schemas/theme'


export function ThemeProvider({ theme }: { theme: Theme }) {
  
  // We don't want the frontend theme completely overriding the admin theme
  // if the colors make it unreadable, but we do want a preview.
  // Actually, we do want to inject the theme globally so the user can preview their site.
  // The `<style>` tag will override CSS variables.

  const generateCSS = (t: Theme) => {
    let css = ''

    // 1. Light palette (Root)
    if (t.light && Object.keys(t.light).length > 0) {
      css += `:root {\n`
      for (const [key, value] of Object.entries(t.light)) {
        css += `  --color-${key}: ${value};\n`
      }
      css += `}\n\n`
    }

    // 2. Dark palette
    if (t.dark && Object.keys(t.dark).length > 0) {
      const darkCss = Object.entries(t.dark)
        .map(([key, value]) => `  --color-${key}: ${value};`)
        .join('\n')
      
      if (t.darkMode === 'auto') {
        css += `@media (prefers-color-scheme: dark) {\n:root {\n${darkCss}\n}\n}\n\n`
      } else if (t.darkMode === 'toggle') {
        css += `.dark {\n${darkCss}\n}\n\n`
      }
    }

    // 3. Layout and Radius
    css += `:root {\n`
    if (t.radius === 'sharp') css += `  --radius: 0.125rem;\n`
    if (t.radius === 'soft') css += `  --radius: 0.5rem;\n`
    if (t.radius === 'round') css += `  --radius: 1rem;\n`
    css += `}\n\n`

    // 4. Type Scale (using the scale to adjust the base fluid calc)
    if (t.typeScale !== 1) {
      css += `html {\n  font-size: ${t.typeScale * 100}%;\n}\n\n`
    }

    // 5. Grain (Paper Texture)
    if (t.grain !== 0.035) {
      css += `:root {\n  --grain-opacity: ${t.grain};\n}\n\n`
    }

    return css
  }

  // Handle dark mode toggle logic
  useEffect(() => {
    if (theme.darkMode === 'off') {
      document.documentElement.classList.remove('dark')
    } else if (theme.darkMode === 'toggle') {
      // Typically, this would read from localStorage, but for now we'll respect system pref
      // or let a toggle button do it.
      // If no class is set and they prefer dark, we can set it.
      if (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [theme.darkMode])

  return (
    <style
      id="theme-provider"
      dangerouslySetInnerHTML={{ __html: generateCSS(theme) }}
    />
  )
}