// lib/auth.ts
//
// Single-owner auth. This site has exactly one editor: whoever owns
// OWNER_EMAIL. Everyone else is refused at sign-in.
//
// Ownership is derived PER REQUEST in the session callback, not stamped into
// the token at sign-in. `signIn` runs once and the JWT lives 30 days, so a
// token minted before OWNER_EMAIL changed would otherwise keep admin access
// for a month.

import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

function ownerEmails(): string[] {
  const value = process.env.OWNER_EMAIL?.trim().toLowerCase()
  return value ? value.split(',').map(e => e.trim()).filter(Boolean) : []
}

/**
 * Fails closed: with OWNER_EMAIL unset, nobody is an owner.
 *
 * Deliberately silent. This runs on every session resolution, so logging the
 * configured owner and the incoming address here put both in the server log on
 * every request.
 */
export function isOwnerEmail(email?: string | null): boolean {
  const owners = ownerEmails()
  if (owners.length === 0 || !email) return false
  return owners.includes(email.trim().toLowerCase())
}

import { getAdminDb } from './admin'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== 'google') return false

      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified
      if (verified === false) return false

      const isOwner = isOwnerEmail(profile?.email)
      
      // If owner successfully authenticates and we got a refresh token, save it for calendar syncing
      if (isOwner && account?.refresh_token && profile?.email) {
        try {
          const db = getAdminDb()
          // Sanitize email to use as a field key in Firestore (replace dots)
          const safeEmailKey = profile.email.replace(/\./g, '_')
          await db.collection('availability').doc('default').set({
            googleRefreshToken: account.refresh_token, // keep legacy field for fallback
            [`googleRefreshTokens.${safeEmailKey}`]: account.refresh_token
          }, { merge: true })
        } catch (e) {
          console.error("Failed to save refresh token:", e)
        }
      }

      return isOwner
    },

    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.isOwner = isOwnerEmail(token.email ?? session.user.email)
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isOwner: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
