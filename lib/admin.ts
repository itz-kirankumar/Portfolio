// lib/admin.ts
//
// Server-only Firebase access. Everything the site reads or writes goes through
// here with admin credentials — the client web SDK is not used anywhere, and
// firestore.rules / storage.rules deny all direct client access.
//
// `firebase-admin` is listed in next.config.ts `serverExternalPackages`, so a
// plain top-level import is safe (it is never bundled for the browser).

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const APP_NAME = 'portfolio-admin'

/** True when the environment can talk to Firebase at all. */
export function hasAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
  )
}

let cached: App | null = null

function getAdminApp(): App {
  if (cached) return cached

  const existing = getApps().find((a) => a.name === APP_NAME)
  if (existing) {
    cached = existing
    return existing
  }

  if (!hasAdminCredentials()) {
    // Callers are expected to catch this. `/` degrades to DEFAULT_CONTENT so a
    // build on a machine without service-account creds still succeeds.
    throw new Error('Firebase admin credentials are not configured')
  }

  cached = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        // Vercel and .env store the PEM with literal \n.
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    },
    APP_NAME
  )

  return cached
}

let cachedDb: Firestore | null = null

export function getAdminDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp())
    try {
      cachedDb.settings({ ignoreUndefinedProperties: true })
    } catch (e) {
      // Ignore "Firestore has already been initialized" in dev HMR
    }
  }
  return cachedDb
}

export function getAdminBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!bucketName) throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set')
  return getStorage(getAdminApp()).bucket(bucketName)
}
