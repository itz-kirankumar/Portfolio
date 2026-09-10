// app/api/upload/route.ts
//
// Owner-only media upload. Two things worth knowing:
//
//  * `makePublic()` is gone. It throws on buckets with uniform bucket-level
//    access (the modern default), which is almost certainly why uploads were
//    failing before. We use a Firebase download token instead: a per-object
//    secret baked into the URL. It never expires, works under UBLA, and can be
//    revoked by clearing the metadata.
//  * Not a GCS signed URL — those cap at 7 days, so a résumé link would
//    silently die a week after upload.

import { randomUUID } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminBucket } from '@/lib/admin'

export const runtime = 'nodejs'

const MAX_BYTES = 15 * 1024 * 1024

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

const FOLDERS = new Set(['photos', 'gallery', 'docs'])

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')
    const rawFolder = String(form.get('folder') ?? 'photos')
    const folder = FOLDERS.has(rawFolder) ? rawFolder : 'photos'

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 15 MB)' }, { status: 413 })
    }

    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: `Unsupported type "${file.type || 'unknown'}". Allowed: JPEG, PNG, WebP, AVIF, GIF, PDF.` },
        { status: 415 }
      )
    }

    const slug =
      file.name
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'file'

    const objectPath = `site/${folder}/${Date.now()}-${slug}.${ext}`
    const token = randomUUID()

    const bucket = getAdminBucket()
    await bucket.file(objectPath).save(Buffer.from(await file.arrayBuffer()), {
      resumable: false,
      contentType: file.type,
      metadata: {
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token },
      },
    })

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      objectPath
    )}?alt=media&token=${token}`

    return NextResponse.json({ url, path: objectPath, name: file.name, contentType: file.type })
  } catch (err) {
    console.error('[upload] failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
