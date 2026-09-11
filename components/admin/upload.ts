// components/admin/upload.ts
//
// Shared client helper for POST /api/upload. The route enforces the owner
// check, a per-type size cap and a MIME allowlist; this just surfaces its errors.

/** Storage prefix under `site/`. Purely organisational — the route validates it. */
export type UploadFolder = 'photos' | 'gallery' | 'docs' | 'video' | 'covers' | 'embeds'

export interface UploadedFile {
  url: string
  path: string
  name: string
  contentType: string
  /** Route's own classification, so callers do not re-parse the MIME string. */
  kind: 'image' | 'pdf' | 'video'
  bytes: number
}

/** Mirrors the route's allowlist so a file picker can filter before uploading. */
export const UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,image/avif,image/gif,application/pdf,video/mp4,video/webm'

export async function uploadFile(file: File, folder: UploadFolder): Promise<UploadedFile> {
  const body = new FormData()
  body.append('file', file)
  body.append('folder', folder)

  const res = await fetch('/api/upload', { method: 'POST', body })

  let payload: unknown = null
  try {
    payload = await res.json()
  } catch {
    // Non-JSON response (proxy error page, etc.) — fall through to the status.
  }

  const data = (payload ?? {}) as Partial<UploadedFile> & { error?: string }

  if (!res.ok || !data.url) {
    throw new Error(data.error ?? `Upload failed (${res.status})`)
  }

  return {
    url: data.url,
    path: data.path ?? '',
    name: data.name ?? file.name,
    contentType: data.contentType ?? file.type,
    kind: data.kind ?? 'image',
    bytes: data.bytes ?? file.size,
  }
}
