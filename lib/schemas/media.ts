// lib/schemas/media.ts
//
// One model for every asset: uploaded images, PDFs and video, plus social
// embeds that live on someone else's server. A single model means a single
// grid, a single filter bar and a single picker, instead of four of each.
//
// Note what is NOT stored: the raw `html` an oEmbed endpoint returns. It is
// third-party markup containing <script> and <iframe>, and keeping it around
// invites someone to render it with dangerouslySetInnerHTML one day. We store
// the structured fields instead and rebuild the embed client-side from the URL.

import { z } from 'zod'

export const MEDIA_KINDS = ['image', 'pdf', 'video', 'embed'] as const
export type MediaKind = (typeof MEDIA_KINDS)[number]

export const EMBED_PLATFORMS = [
  'youtube',
  'instagram',
  'linkedin',
  'x',
  'tiktok',
  'facebook',
  'pinterest',
  'github',
  'map',
  'other',
] as const
export type EmbedPlatform = (typeof EMBED_PLATFORMS)[number]

const str = z.string().trim()

export const mediaSchema = z.object({
  kind: z.enum(MEDIA_KINDS),

  /** Null for uploaded files; set for every `kind: 'embed'`. */
  platform: z.enum(EMBED_PLATFORMS).nullable().default(null),

  /** Storage download URL, or the canonical third-party URL for an embed. */
  url: str.max(2000),

  /** Object path in the bucket. Empty for embeds — nothing to delete. */
  storagePath: str.max(500).default(''),

  /** Poster/thumbnail. From oEmbed for embeds, from `url` itself for images. */
  thumbUrl: str.max(2000).default(''),

  title: str.max(200).default(''),
  caption: str.max(600).default(''),
  /** Screen-reader text. Empty is legitimate for purely decorative images. */
  alt: str.max(300).default(''),
  tags: z.array(str.max(40)).max(20).default([]),

  width: z.number().int().min(0).max(100000).default(0),
  height: z.number().int().min(0).max(100000).default(0),
  bytes: z.number().int().min(0).default(0),
  contentType: str.max(120).default(''),

  /** Attribution from oEmbed, so an embed card can credit its author. */
  authorName: str.max(200).default(''),
  authorUrl: str.max(2000).default(''),
  providerName: str.max(80).default(''),

  /** Surfaced in the homepage shelf block. */
  featured: z.boolean().default(false),

  createdAt: z.number().int().default(0),
  updatedAt: z.number().int().default(0),
})

export type Media = z.infer<typeof mediaSchema> & { id: string }

/** The subset the admin UI is allowed to edit after creation. */
export const mediaEditSchema = mediaSchema
  .pick({ title: true, caption: true, alt: true, tags: true, featured: true })
  .partial()

export const MEDIA_COLLECTION = 'media'

/** Which filter tab an asset lands under. */
export function kindLabel(kind: MediaKind): string {
  return { image: 'Image', pdf: 'PDF', video: 'Video', embed: 'Embed' }[kind]
}
