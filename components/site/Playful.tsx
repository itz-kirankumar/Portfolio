'use client'
// components/site/Playful.tsx
//
// Playful layer for the hero: a rotating highlight word, a spinning circular
// badge, and a coral glow that follows the cursor. All three are decorative,
// respect prefers-reduced-motion, and never change the underlying copy the
// site owner wrote — the base headline always renders first and stays the
// default.

import { useEffect, useRef, useState } from 'react'

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------------------------------------------------- Rotating highlight --- */

export function RotatingHighlight({ base, variants, className }: { base: string; variants: string[]; className?: string }) {
  const pool = [base, ...variants]
  const [i, setI] = useState(0)
  const [flip, setFlip] = useState(false)

  useEffect(() => {
    if (reduced()) return
    const t = setInterval(() => {
      setFlip(true)
      setTimeout(() => {
        setI((n) => (n + 1) % pool.length)
        setFlip(false)
      }, 180)
    }, 2600)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        transition: 'opacity 180ms ease',
        opacity: flip ? 0 : 1,
      }}
    >
      {pool[i]}
    </span>
  )
}

/* ------------------------------------------------------ Spinning badge --- */

export function SpinBadge({ text, className }: { text: string; className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <svg viewBox="0 0 120 120" className="size-full animate-[spin_14s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path id="badge-circle" d="M 60,60 m -44,0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0" />
        </defs>
        <circle cx="60" cy="60" r="59" className="fill-paper-deep/85 stroke-coral/50" strokeWidth="1" />
        <text className="fill-coral-ink font-mono" style={{ fontSize: 10.2, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          <textPath href="#badge-circle">{text}</textPath>
        </text>
        <text x="60" y="66" textAnchor="middle" className="fill-coral" style={{ fontSize: 20 }}>
          ✳
        </text>
      </svg>
    </div>
  )
}

/* -------------------------------------------------------- Cursor glow --- */

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    const parent = el.parentElement
    if (!parent) return
    let raf = 0
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect()
        el.style.background = `radial-gradient(34rem circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgb(255 106 82 / 0.10), transparent 65%)`
      })
    }
    parent.addEventListener('pointermove', move)
    return () => {
      parent.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block" />
}
