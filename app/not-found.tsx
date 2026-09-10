// app/not-found.tsx
import Link from 'next/link'
import { Button, Eyebrow, StickyNote } from '@/components/ui/primitives'

export default function NotFound() {
  return (
    <main className="paper-grain grid min-h-screen place-items-center bg-paper px-6">
      <div className="max-w-md text-center">
        <Eyebrow className="mb-6 text-center">404</Eyebrow>

        <h1 className="font-display text-[clamp(2.4rem,8vw,3.5rem)] font-semibold leading-[1] tracking-[-0.03em] text-ink">
          This page never got built.
        </h1>

        <p className="mt-5 text-[1rem] leading-relaxed text-ink-soft">
          Which is on brand, honestly — I only ship the things people actually use.
        </p>

        <div className="mt-8 flex justify-center">
          <Button href="/" variant="solid" size="lg">
            Back to the start
          </Button>
        </div>

        <div className="mt-14 flex justify-center">
          <StickyNote rotate={-3} className="max-w-[13rem]">
            check the link,
            <br />
            or just start over
          </StickyNote>
        </div>

        {/* Keeps next/link in the tree for prefetching the home route. */}
        <Link href="/" className="sr-only">
          Home
        </Link>
      </div>
    </main>
  )
}
