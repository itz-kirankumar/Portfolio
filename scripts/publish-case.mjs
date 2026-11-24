// Publish or swap a view-only case file.
//   node scripts/publish-case.mjs <slug> <file.pdf> --title "..." --kind deck|case \
//        --blurb "..." --label "v2 final" --order 1
// Renders each page to a JPEG, encrypts it (AES-256-GCM, CASES_KEY), writes the
// new version, flips the pointer, deletes the old pages, then revalidates "/".
// Re-running with the same slug swaps the file; omitted flags keep old values.
// Needs poppler (pdftoppm) and .env.local with the Firebase admin vars + CASES_KEY.
import { execFileSync } from 'node:child_process'
import { createCipheriv, randomBytes } from 'node:crypto'
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

process.loadEnvFile('.env.local')
const [slug, file, ...rest] = process.argv.slice(2)
const f = {}
for (let i = 0; i < rest.length; i += 2) f[rest[i].replace(/^--/, '')] = rest[i + 1]
if (!slug || !file) throw new Error('usage: publish-case.mjs <slug> <file.pdf> [--title ..] [--label ..]')
const key = Buffer.from(process.env.CASES_KEY, 'base64')
if (key.length !== 32) throw new Error('CASES_KEY must be 32 bytes base64')

initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
}) })
const db = getFirestore()
const ref = db.collection('caseFiles').doc(slug)
const prev = (await ref.get()).data() || {}
const version = (prev.version || 0) + 1

const dir = mkdtempSync(join(tmpdir(), 'case-'))
const info = execFileSync('pdfinfo', [file]).toString()
const [, w, h] = info.match(/Page size:\s+([\d.]+) x ([\d.]+)/)
const aspect = Number(w) / Number(h)
execFileSync('pdftoppm', ['-jpeg', '-jpegopt', 'quality=82', '-scale-to-x', aspect >= 1 ? '1600' : '1300', '-scale-to-y', '-1', file, join(dir, 'p')])
const imgs = readdirSync(dir).filter((n) => n.endsWith('.jpg')).sort()

for (let i = 0; i < imgs.length; i++) {
  const n = i + 1
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', key, iv)
  c.setAAD(Buffer.from(`${slug}:${version}:${n}`))
  const ct = Buffer.concat([c.update(readFileSync(join(dir, imgs[i]))), c.final()])
  const blob = Buffer.concat([iv, c.getAuthTag(), ct])
  if (blob.length > 950_000) throw new Error(`page ${n} too large (${blob.length})`)
  await ref.collection('pages').doc(`v${version}_${n}`).set({ data: blob })
}
await ref.set({
  title: f.title ?? prev.title, kind: f.kind ?? prev.kind, blurb: f.blurb ?? prev.blurb,
  versionLabel: f.label ?? prev.versionLabel, order: Number(f.order ?? prev.order ?? 1),
  pages: imgs.length, version, aspect, updatedAt: Date.now(),
})
for (let n = 1; n <= (prev.pages || 0); n++) await ref.collection('pages').doc(`v${prev.version}_${n}`).delete()
console.log(`published ${slug} v${version}: ${imgs.length} pages, label "${f.label ?? prev.versionLabel}"`)
if (process.env.CASES_REVALIDATE_TOKEN && process.env.SITE_URL) {
  const r = await fetch(`${process.env.SITE_URL}/api/cases/revalidate`, { method: 'POST', headers: { 'x-cases-token': process.env.CASES_REVALIDATE_TOKEN } })
  console.log('revalidate', r.status)
}
