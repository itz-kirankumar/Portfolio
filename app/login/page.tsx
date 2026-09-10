// app/login/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import SignInButton from './SignInButton'
import { Eyebrow } from '@/components/ui/primitives'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

const ERRORS: Record<string, string> = {
  AccessDenied:
    'That Google account is not the owner of this site, so it cannot sign in. If this should be you, check OWNER_EMAIL.',
  Configuration:
    'Sign-in is misconfigured on the server. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and NEXTAUTH_SECRET.',
  Verification: 'That sign-in link has expired. Try again.',
  OAuthAccountNotLinked: 'That email is already linked to a different sign-in method.',
}

export default async function LoginPage({
  searchParams,
}: {
  // searchParams is a Promise in Next 16.
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (session?.user?.isOwner) redirect('/admin')

  const { error, callbackUrl } = await searchParams
  const message = error ? (ERRORS[error] ?? 'Sign-in failed. Try again.') : null

  return (
    <main className="paper-grain grid min-h-screen place-items-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Eyebrow className="mb-5 text-center">site admin</Eyebrow>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.025em] text-ink">
            Sign in to edit
          </h1>
          <p className="mt-3 text-[0.94rem] leading-relaxed text-ink-soft">
            One account can edit this site. Everyone else just gets to read it.
          </p>
        </div>

        {message ? (
          <p
            role="alert"
            className="mt-8 rounded-lg bg-coral-soft px-4 py-3 text-[0.88rem] leading-relaxed text-coral-ink ring-1 ring-coral/30"
          >
            {message}
          </p>
        ) : null}

        <div className="mt-8">
          <SignInButton callbackUrl={callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/admin'} />
        </div>

        <p className="mt-10 text-center">
          <Link href="/" className="link-underline text-[0.85rem] text-ink-soft hover:text-ink">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  )
}
