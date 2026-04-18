// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Lazy-load firebase-admin to avoid client-side bundling
async function getAdminStorage() {
  const { initializeApp, cert, getApps, getApp } = await import('firebase-admin/app')
  const { getStorage } = await import('firebase-admin/storage')

  const apps = getApps()
  const adminApp = apps.length > 0
    ? getApp()
    : initializeApp({
        credential: cert({
          projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
          privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })

  return getStorage(adminApp).bucket()
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const folder   = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 20MB)' }, { status: 400 })
    }

    const bytes    = await file.arrayBuffer()
    const buffer   = Buffer.from(bytes)
    const ext      = file.name.split('.').pop() ?? 'bin'
    const filename = `users/${session.user.id}/${folder}/${Date.now()}.${ext}`

    const bucket  = await getAdminStorage()
    const fileRef = bucket.file(filename)

    await fileRef.save(buffer, { metadata: { contentType: file.type } })
    await fileRef.makePublic()

    const url = `https://storage.googleapis.com/${bucket.name}/${filename}`
    return NextResponse.json({ url, filename: file.name })
  } catch (err) {
    console.error('[Upload] error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}