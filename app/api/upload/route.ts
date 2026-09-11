// app/api/upload/route.ts
//
// Owner-only media upload. Four things worth knowing:
//
//  * `makePublic()` is gone. It throws on buckets with uniform bucket-level
//    access (the modern default), which is almost certainly why uploads were
//    failing before. We use a Firebase download token instead: a per-object
//    secret baked into the URL. It never expires, works under UBLA, and can be
//    revoked by clearing the metadata.
//  * Not a GCS signed URL — those cap at 7 days, so a résumé link would
//    silently die a week after upload.
//  * The body is piped to GCS rather than collected into a Buffer, so a large
//    video does not need a second full copy of itself in memory.
//  * `resumable: false` is deliberate. Resumable uploads keep their state in a
//    config file under the home directory, which is exactly the thing that is
//    absent or read-only on a serverless host.
//
// DEPLOYMENT LIMIT: `req.formData()` buffers each file part before we see it, and
// most managed hosts cap request bodies well below the video limit here (Vercel
// at 4.5 MB). Self-hosted Node has no such cap. If large video uploads need to
// work on a capped host, the file has to go browser -> GCS via a signed
// resumable-upload URL minted by this route; that is a different flow, not a
// bigger number in this file.

import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { NextResponse, type NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdminBucket } from '@/lib/admin'

export const runtime = 'nodejs'

const MB = 1024 * 1024

/**
 * MIME -> extension, category and its own size cap. Capping per type rather than
 * globally means a 40 MB "photo" is still refused while a 40 MB screen recording
 * is not.
 *
 * SVG is absent on purpose. An SVG is a script container, and a stored one is an
 * XSS vector the moment anything renders it inline.
 */
const ALLOWED: Record<string, { ext: string; kind: 'image' | 'pdf' | 'video'; max: number }> = {
  'image/jpeg': { ext: 'jpg', kind: 'image', max: 15 * MB },
  'image/png': { ext: 'png', kind: 'image', max: 15 * MB },
  'image/webp': { ext: 'webp', kind: 'image', max: 15 * MB },
  'image/avif': { ext: 'avif', kind: 'image', max: 15 * MB },
  'image/gif': { ext: 'gif', kind: 'image', max: 15 * MB },
  'application/pdf': { ext: 'pdf', kind: 'pdf', max: 15 * MB },
  'video/mp4': { ext: 'mp4', kind: 'video', max: 200 * MB },
  'video/webm': { ext: 'webm', kind: 'video', max: 200 * MB },
}

const FOLDERS = new Set(['photos', 'gallery', 'docs', 'video', 'covers', 'embeds'])

const ALLOWED_LABEL = 'JPEG, PNG, WebP, AVIF, GIF, PDF, MP4, WebM'

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

    const spec = ALLOWED[file.type]
    if (!spec) {
      return NextResponse.json(
        {
          error: `Unsupported type "${file.type || 'unknown'}". Allowed: ${ALLOWED_LABEL}.`,
        },
        { status: 415 }
      )
    }

    if (file.size > spec.max) {
      return NextResponse.json(
        { error: `File too large — ${spec.kind} files are capped at ${Math.round(spec.max / MB)} MB.` },
        { status: 413 }
      )
    }

    const slug =
      file.name
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) || 'file'

    const objectPath = `site/${folder}/${Date.now()}-${slug}.${spec.ext}`
    const token = randomUUID()

    const bucket = getAdminBucket()
    const target = bucket.file(objectPath)

    await pipeline(
      Readable.fromWeb(file.stream() as Parameters<typeof Readable.fromWeb>[0]),
      target.createWriteStream({
        resumable: false,
        contentType: file.type,
        metadata: {
          cacheControl: 'public, max-age=31536000, immutable',
          metadata: { firebaseStorageDownloadTokens: token },
        },
      })
    )

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      objectPath
    )}?alt=media&token=${token}`

    return NextResponse.json({
      url,
      path: objectPath,
      name: file.name,
      contentType: file.type,
      kind: spec.kind,
      bytes: file.size,
    })
  } catch (err) {
    console.error('[upload] failed:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
