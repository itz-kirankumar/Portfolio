// lib/store.ts
//
// One CRUD layer for every collection that is not `site/content` (that document
// has its own anti-clobber rules — see lib/site.ts).
//
// Two deliberate asymmetries:
//
//   READ is tolerant. A single malformed document must not blank an entire admin
//   list page, so reads `safeParse` per row and skip failures with a warning.
//   Schemas gain `.default()`s over time and old documents predate them.
//
//   WRITE is strict. Anything that fails validation is rejected before it
//   reaches Firestore, so the tolerant read never has to paper over our own bugs.
//
// Every function here throws when credentials are missing. Public readers must
// wrap calls in `safeList`/`safeGet` (or their own try/catch) so `next build`
// still succeeds on a machine without FIREBASE_ADMIN_* — the same guarantee
// getSiteContent() gives.

import 'server-only'
import type { z } from 'zod'
import { getAdminDb, hasAdminCredentials } from '@/lib/admin'

export type Where = [field: string, op: FirebaseFirestore.WhereFilterOp, value: unknown]

export interface ListOptions {
  where?: Where[]
  orderBy?: [field: string, direction?: 'asc' | 'desc']
  limit?: number
  offset?: number
  /** Skip the Zod pass. Only for internal bookkeeping reads. */
  raw?: boolean
}

/** `id` is always the document id, overriding any stored field of that name. */
export type WithId<T> = T & { id: string }

function collection(name: string) {
  return getAdminDb().collection(name)
}

/* ----------------------------------------------------------------- reads --- */

export async function listDocs<S extends z.ZodTypeAny>(
  name: string,
  schema: S,
  options: ListOptions = {}
): Promise<WithId<z.infer<S>>[]> {
  let query: FirebaseFirestore.Query = collection(name)

  for (const [field, op, value] of options.where ?? []) {
    query = query.where(field, op, value as never)
  }
  if (options.orderBy) {
    query = query.orderBy(options.orderBy[0], options.orderBy[1] ?? 'asc')
  }
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.offset(options.offset)
  }

  const snap = await query.get()
  const out: WithId<z.infer<S>>[] = []

  for (const doc of snap.docs) {
    const parsed = schema.safeParse(doc.data())
    if (parsed.success) {
      out.push({ ...(parsed.data as object), id: doc.id } as WithId<z.infer<S>>)
    } else {
      console.warn(
        `[store] skipping ${name}/${doc.id}:`,
        parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      )
    }
  }

  return out
}

export async function getDocById<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S
): Promise<WithId<z.infer<S>> | null> {
  const snap = await collection(name).doc(id).get()
  if (!snap.exists) return null

  const parsed = schema.safeParse(snap.data())
  if (!parsed.success) {
    console.warn(
      `[store] ${name}/${id} failed validation:`,
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
    return null
  }

  return { ...(parsed.data as object), id: snap.id } as WithId<z.infer<S>>
}

export async function countDocs(name: string, where: Where[] = []): Promise<number> {
  let query: FirebaseFirestore.Query = collection(name)
  for (const [field, op, value] of where) query = query.where(field, op, value as never)
  const snap = await query.count().get()
  return snap.data().count
}

/**
 * Degrading wrappers for public pages and prerenders. Return the fallback rather
 * than throwing when Firebase is unreachable or unconfigured, which is what
 * keeps `next build` green without service-account credentials.
 */
export async function safeList<S extends z.ZodTypeAny>(
  name: string,
  schema: S,
  options: ListOptions = {}
): Promise<WithId<z.infer<S>>[]> {
  if (!hasAdminCredentials()) return []
  try {
    return await listDocs(name, schema, options)
  } catch (err) {
    console.error(`[store] list ${name} failed:`, err)
    return []
  }
}

export async function safeGet<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S
): Promise<WithId<z.infer<S>> | null> {
  if (!hasAdminCredentials()) return null
  try {
    return await getDocById(name, id, schema)
  } catch (err) {
    console.error(`[store] get ${name}/${id} failed:`, err)
    return null
  }
}

export async function safeCount(name: string, where: Where[] = []): Promise<number> {
  if (!hasAdminCredentials()) return 0
  try {
    return await countDocs(name, where)
  } catch {
    return 0
  }
}

/* ---------------------------------------------------------------- writes --- */

export class ValidationError extends Error {
  issues: string[]
  constructor(issues: string[]) {
    super('Validation failed')
    this.name = 'ValidationError'
    this.issues = issues
  }
}

export class AlreadyExistsError extends Error {
  constructor(path: string) {
    super(`${path} already exists`)
    this.name = 'AlreadyExistsError'
  }
}

function parseStrict<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`)
    )
  }
  return parsed.data
}

/**
 * Full replace. `id` never lands in the document body — it is the document id,
 * and storing it twice guarantees they eventually disagree.
 */
export async function putDoc<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S,
  data: unknown
): Promise<WithId<z.infer<S>>> {
  const value = parseStrict(schema, data)
  const { id: _ignored, ...body } = value as Record<string, unknown>
  await collection(name).doc(id).set(body)
  return { ...(value as object), id } as WithId<z.infer<S>>
}

/**
 * Create-or-fail. The reason bookings use a deterministic document id: two
 * people clicking the same slot in the same second both call this, Firestore
 * rejects the second with ALREADY_EXISTS, and there is no read-then-write race
 * to lose.
 */
export async function createStrict<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S,
  data: unknown
): Promise<WithId<z.infer<S>>> {
  const value = parseStrict(schema, data)
  const { id: _ignored, ...body } = value as Record<string, unknown>

  try {
    await collection(name).doc(id).create(body)
  } catch (err) {
    // Firestore surfaces this as gRPC code 6.
    if ((err as { code?: number }).code === 6) throw new AlreadyExistsError(`${name}/${id}`)
    throw err
  }

  return { ...(value as object), id } as WithId<z.infer<S>>
}

/**
 * Partial update using `mergeFields`, not `{ merge: true }`. Plain merge
 * recurses into nested maps, so clearing a key inside `newsletter` or `payment`
 * would silently leave the old value behind. mergeFields replaces the named
 * top-level paths outright.
 */
export async function patchDoc(
  name: string,
  id: string,
  patch: Record<string, unknown>
): Promise<void> {
  const fields = Object.keys(patch)
  if (fields.length === 0) return
  await collection(name).doc(id).set(patch, { mergeFields: fields })
}

export async function deleteDocById(name: string, id: string): Promise<void> {
  await collection(name).doc(id).delete()
}

/** Read a singleton (`availability/default`, `theme/active`) with a default. */
export async function getSingleton<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S,
  fallback: z.infer<S>
): Promise<z.infer<S>> {
  if (!hasAdminCredentials()) return fallback
  try {
    const snap = await collection(name).doc(id).get()
    if (!snap.exists) return fallback
    const parsed = schema.safeParse(snap.data())
    return parsed.success ? parsed.data : fallback
  } catch (err) {
    console.error(`[store] singleton ${name}/${id} failed:`, err)
    return fallback
  }
}

export async function putSingleton<S extends z.ZodTypeAny>(
  name: string,
  id: string,
  schema: S,
  data: unknown
): Promise<z.infer<S>> {
  const value = parseStrict(schema, data)
  await collection(name).doc(id).set(value as object)
  return value
}
