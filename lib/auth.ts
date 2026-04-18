// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getProfile, createProfile } from './firestore'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
}),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.id && user.email) {
        try {
          const existing = await getProfile(user.id)
          if (!existing) {
            // Generate clean username from email prefix
            const base = user.email
              .split('@')[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
            const username = base + Math.floor(Math.random() * 1000)

            await createProfile(user.id, {
              uid: user.id,
              email: user.email,
              displayName: user.name ?? user.email.split('@')[0],
              avatar: user.image ?? undefined,
              username,
              bio: '',
              location: '',
              website: '',
              theme: {
                preset: 'Dark Mint',
                primaryColor: '#7ef0c8',
                accentColor: '#818cf8',
                bgColor: '#0a0a0f',
                surfaceColor: '#13131a',
                textColor: '#e8e6e0',
                headingFont: 'Syne',
                bodyFont: 'DM Sans',
                borderRadius: 'lg',
                darkMode: true,
              },
              seo: {},
            })
          }
        } catch (err) {
          console.error('[NextAuth] signIn error:', err)
        }
      }
      return true
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },

    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id
      return token
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

  debug: true, // Hardcoded to true temporarily to help you see the logs
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}