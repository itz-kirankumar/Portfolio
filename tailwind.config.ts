// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: '#7ef0c8',
        accent: '#818cf8',
      },
    },
  },
  // NOTE: @tailwindcss/typography is added via CSS in globals.css for Tailwind v4
  // If using Tailwind v3, uncomment the plugins line below:
  // plugins: [require('@tailwindcss/typography')],
}

export default config