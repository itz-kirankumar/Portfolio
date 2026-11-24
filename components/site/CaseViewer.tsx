'use client'

// View-only reader. Pages arrive as images from /api/cases (decrypted on the
// server, never cached). There is no download control and no PDF file in the
// page. This deters casual saving; it cannot stop screenshots.

import { useCallback, useEffect, useRef, useState } from 'react'

export function CaseViewer({
  slug, title, pages, aspect, version,
}: { slug: string; title: string; pages: number; aspect: number; version: number }) {
  const [page, setPage] = useState(1)
  const [loaded, setLoaded] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  const go = useCallback((n: number) => {
    setPage((p) => {
      const next = Math.min(pages, Math.max(1, n))
      if (next !== p) setLoaded(false)
      return next
    })
  }, [pages])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!box.current?.contains(document.activeElement) && document.activeElement !== document.body) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(page + 1) }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(page - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, page])

  // Warm the next page.
  useEffect(() => {
    if (page < pages) { const i = new Image(); i.src = `/api/cases/${slug}/${page + 1}?v=${version}` }
  }, [page, pages, slug, version])

  const src = (n: number) => `/api/cases/${slug}/${n}?v=${version}`
  const btn = 'rounded-full border border-rule px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition hover:border-coral hover:text-coral-ink disabled:opacity-30 disabled:hover:border-rule disabled:hover:text-ink'

  return (
    <div ref={box} className="case-viewer" onContextMenu={(e) => e.preventDefault()}>
      <div
        className="relative mx-auto w-full overflow-hidden rounded-xl border border-rule bg-card"
        style={{ aspectRatio: String(aspect), maxWidth: aspect < 1 ? '46rem' : '70rem' }}
      >
        {!loaded && <div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">Loading page {page}</div>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={page}
          src={src(page)}
          alt={`${title}, page ${page} of ${pages}`}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full select-none object-contain"
          style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none', opacity: loaded ? 1 : 0 }}
        />
        <div className="absolute inset-0" aria-hidden="true" />
      </div>
      <div className="mt-5 flex items-center justify-center gap-4">
        <button type="button" className={btn} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Previous page">Prev</button>
        <span className="font-mono text-xs tracking-[0.14em] text-ink-soft" aria-live="polite">{page} / {pages}</span>
        <button type="button" className={btn} onClick={() => go(page + 1)} disabled={page >= pages} aria-label="Next page">Next</button>
      </div>
      <style>{`@media print{.case-viewer{display:none!important}}`}</style>
    </div>
  )
}
