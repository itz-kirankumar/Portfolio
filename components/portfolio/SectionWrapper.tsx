'use client'
// components/portfolio/SectionWrapper.tsx
import React from 'react'

interface Props {
  children: React.ReactNode
  id?: string
  className?: string
}

export default function SectionWrapper({ children, id, className = "" }: Props) {
  return (
    <section 
      id={id} 
      className={`max-w-5xl mx-auto px-6 py-12 sm:py-20 ${className}`}
      suppressHydrationWarning
    >
      {children}
    </section>
  )
}