'use client'
import { useState } from 'react'
import { CaseViewer } from '@/components/site/CaseViewer'

type Doc = { slug: string; tab: string; title: string; pages: number; aspect: number; version: number; versionLabel: string }

export function CaseTabs({ docs }: { docs: Doc[] }) {
  const [i, setI] = useState(0)
  const d = docs[i]
  return (
    <div>
      <div role="tablist" className="mb-6 flex flex-wrap gap-2">
        {docs.map((x, n) => (
          <button key={x.slug} role="tab" aria-selected={n === i} type="button" onClick={() => setI(n)}
            className={`rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-[0.14em] transition ${n === i ? 'border-coral bg-coral text-white' : 'border-rule text-ink hover:border-coral'}`}>
            {x.tab}
          </button>
        ))}
      </div>
      <p className="mb-4 font-mono text-xs tracking-[0.1em] text-ink-soft">{d.versionLabel} · view only</p>
      <CaseViewer key={d.slug} slug={d.slug} title={d.title} pages={d.pages} aspect={d.aspect} version={d.version} />
    </div>
  )
}
