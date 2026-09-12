import imageCompression from 'browser-image-compression'

export async function processAndUploadMediaFile(file: File): Promise<any> {
  let fileToUpload = file

  if (file.type.match(/^image\/(jpeg|png|webp)$/) && file.size > 1024 * 1024) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    }
    try {
      fileToUpload = await imageCompression(file, options)
    } catch (err) {
      console.warn('Image compression failed, using original file', err)
    }
  }

  // 1. Get Signed URL
  const reqRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: file.name,
      type: fileToUpload.type,
      size: fileToUpload.size,
      folder: 'gallery',
    }),
  })

  const reqJson = await reqRes.json()
  if (!reqRes.ok) throw new Error(reqJson.error || 'Failed to initialize upload')

  // 2. Upload directly to GCS
  const uploadRes = await fetch(reqJson.signedUrl, {
    method: 'PUT',
    headers: reqJson.uploadHeaders,
    body: fileToUpload,
  })

  if (!uploadRes.ok) {
    throw new Error(`Cloud storage upload failed (Status ${uploadRes.status})`)
  }

  return {
    url: reqJson.url,
    storagePath: reqJson.path,
    kind: reqJson.kind,
    contentType: reqJson.contentType,
    bytes: reqJson.bytes,
    title: file.name.split('.')[0],
  }
}
