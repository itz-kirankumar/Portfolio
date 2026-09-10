// components/ui/primitives.tsx
//
// The paper-desk vocabulary. Everything visually distinctive on the site is
// assembled from these, so a change here changes the whole page consistently.
// All server components — none of them need state.

import Image from 'next/image'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------- Eyebrow --- */

export function Eyebrow({
  children,
  className,
  tone = 'coral',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'coral' | 'ink' | 'paper'
}) {
  return (
    <p
      className={cn(
        'font-mono text-[0.68rem] uppercase tracking-[0.18em] leading-none',
        tone === 'coral' && 'text-coral-ink',
        tone === 'ink' && 'text-ink-soft',
        tone === 'paper' && 'text-paper/70',
        className
      )}
    >
      <span aria-hidden="true" className="mr-1.5">
        ▸
      </span>
      {children}
    </p>
  )
}

/* ------------------------------------------------------------ Highlight --- */

/** Coral marker sweep behind inline text. Decorative only — never the sole cue. */
export function Highlight({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <span className={cn('marker-sweep', className)}>{children}</span>
}

/**
 * Authoring convention for editable headings: wrap the words that should get
 * the coral marker in *asterisks*. Lets the whole heading stay one editable
 * string in /admin instead of three fields that must be reassembled in code.
 *
 *   "The deck is the *smallest part*."  ->  The deck is the ⟨smallest part⟩.
 */
export function marked(text: string): React.ReactNode {
  if (!text.includes('*')) return text
  return text.split(/(\*[^*]+\*)/g).map((chunk, i) =>
    chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2 ? (
      <Highlight key={i}>{chunk.slice(1, -1)}</Highlight>
    ) : (
      chunk
    )
  )
}

/* ----------------------------------------------------------------- Tape --- */

/** A strip of masking tape. Absolutely positioned by the parent. */
export function Tape({
  className,
  rotate = -4,
  width = 88,
}: {
  className?: string
  rotate?: number
  width?: number
}) {
  return (
    <span
      aria-hidden="true"
      style={{ transform: `rotate(${rotate}deg)`, width }}
      className={cn(
        'pointer-events-none absolute z-20 block h-6',
        'bg-coral/25 shadow-[0_1px_2px_rgba(26,24,21,0.10)]',
        'backdrop-blur-[1px]',
        // torn, slightly irregular ends
        '[clip-path:polygon(3%_0,97%_2%,100%_88%,96%_100%,4%_97%,0_12%)]',
        className
      )}
    />
  )
}

/* ------------------------------------------------------------- Polaroid --- */

export function Polaroid({
  src,
  alt,
  caption,
  rotate = -2,
  priority = false,
  className,
  sizes = '(min-width: 1024px) 22rem, 60vw',
}: {
  src: string
  alt: string
  caption?: string
  rotate?: number
  priority?: boolean
  className?: string
  sizes?: string
}) {
  return (
    <figure
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        'relative bg-card p-3 pb-4 shadow-lift ring-1 ring-rule/70',
        'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:rotate-0',
        className
      )}
    >
      <Tape className="-top-3 left-1/2 -translate-x-1/2" rotate={rotate > 0 ? -5 : 5} />
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper-deep">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center font-hand text-xl leading-none text-ink-soft">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

/* ----------------------------------------------------------- StickyNote --- */

export function StickyNote({
  children,
  rotate = 2,
  className,
}: {
  children: React.ReactNode
  rotate?: number
  className?: string
}) {
  return (
    <div
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        'relative bg-coral-soft px-5 py-4 shadow-paper',
        'font-hand text-xl leading-snug text-ink',
        // curled corner
        'after:absolute after:right-0 after:bottom-0 after:h-5 after:w-5',
        'after:bg-paper after:[clip-path:polygon(100%_0,100%_100%,0_100%)]',
        className
      )}
    >
      {children}
    </div>
  )
}

/* --------------------------------------------------------- NotebookCard --- */

/** Spiral-bound page: binding holes down the left, faint rules behind the text. */
export function NotebookCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-r-lg bg-card shadow-lift ring-1 ring-rule',
        className
      )}
    >
      {/* binding gutter */}
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-12 bg-paper-deep/70">
        <div className="absolute inset-y-0 right-0 w-px bg-coral/40" />
        <div className="flex h-full flex-col items-center justify-evenly py-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block size-2.5 rounded-full bg-paper shadow-[inset_0_1px_2px_rgba(26,24,21,0.25)] ring-1 ring-rule"
            />
          ))}
        </div>
      </div>
      <div className="notebook-rules relative pl-16 pr-6 py-8 sm:pl-20 sm:pr-10 sm:py-10">
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- CredPill --- */

export function CredPill({ text, year }: { text: string; year?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full bg-card',
        'px-4 py-2 shadow-paper ring-1 ring-rule',
        'transition-colors duration-300 hover:ring-coral/50'
      )}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-coral" />
      <span className="text-[0.83rem] leading-tight text-ink">{text}</span>
      {year ? (
        <span className="font-mono text-[0.68rem] tracking-wider text-ink-soft">{year}</span>
      ) : null}
    </span>
  )
}

/* ---------------------------------------------------------- SectionHead --- */

export function SectionHead({
  eyebrow,
  heading,
  intro,
  align = 'left',
  tone = 'ink',
  className,
}: {
  eyebrow?: string
  heading: React.ReactNode
  intro?: string
  align?: 'left' | 'center'
  tone?: 'ink' | 'paper'
  className?: string
}) {
  return (
    <header
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <Eyebrow
          tone={tone === 'paper' ? 'paper' : 'coral'}
          className={cn('mb-4', align === 'center' && 'text-center')}
        >
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'font-display text-balance-tight text-[clamp(1.9rem,4.4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]',
          tone === 'paper' ? 'text-paper' : 'text-ink'
        )}
      >
        {typeof heading === 'string' ? marked(heading) : heading}
      </h2>
      {intro ? (
        <p
          className={cn(
            'mt-4 text-[1.02rem] leading-relaxed',
            tone === 'paper' ? 'text-paper/70' : 'text-ink-soft'
          )}
        >
          {intro}
        </p>
      ) : null}
    </header>
  )
}

/* -------------------------------------------------------------- Section --- */

export function Section({
  id,
  children,
  className,
  tone = 'paper',
  bleed = false,
}: {
  id?: string
  children: React.ReactNode
  className?: string
  tone?: 'paper' | 'deep' | 'dark'
  /** Skip the gutter — for sections that manage their own width. */
  bleed?: boolean
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 py-16 sm:py-24 lg:py-32',
        tone === 'paper' && 'bg-paper',
        tone === 'deep' && 'bg-paper-deep',
        tone === 'dark' && 'bg-slate-deep text-paper',
        className
      )}
    >
      {bleed ? children : <div className="gutter">{children}</div>}
    </section>
  )
}

/* --------------------------------------------------------------- Button --- */

export function Button({
  href,
  children,
  variant = 'solid',
  size = 'md',
  className,
  external = false,
}: {
  href: string
  children: React.ReactNode
  variant?: 'solid' | 'outline' | 'ghost' | 'onDark'
  size?: 'md' | 'lg'
  className?: string
  external?: boolean
}) {
  const isExternal = external || /^https?:|^mailto:|^tel:/.test(href)
  return (
    <a
      href={href}
      {...(isExternal && href.startsWith('http')
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium',
        'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        size === 'md' ? 'px-5 py-2.5 text-[0.92rem]' : 'px-7 py-3.5 text-[1rem]',
        variant === 'solid' &&
          'bg-coral-deep text-white shadow-paper hover:-translate-y-0.5 hover:bg-coral-ink hover:shadow-lift',
        variant === 'outline' &&
          'bg-card text-ink ring-1 ring-rule hover:-translate-y-0.5 hover:ring-coral/60 hover:shadow-paper',
        variant === 'ghost' && 'text-coral-ink hover:bg-coral-soft',
        variant === 'onDark' &&
          'bg-paper text-ink hover:-translate-y-0.5 hover:bg-white',
        className
      )}
    >
      {children}
    </a>
  )
}

/* ----------------------------------------------------------- RuleDivider --- */

export function RuleDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center gap-3', className)}>
      <span className="h-px flex-1 bg-rule" />
      <span className="size-1.5 rotate-45 bg-coral/60" />
      <span className="h-px flex-1 bg-rule" />
    </div>
  )
}
