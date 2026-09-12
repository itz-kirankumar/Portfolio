import { z } from 'zod'

export const PAGES_COLLECTION = 'pages'

export const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  html: z.string().default(''),
  doc: z.string().default(''), // JSON string of Tiptap document
  status: z.enum(['draft', 'published']).default('draft'),
  showInNav: z.boolean().default(false),
  updatedAt: z.number().int().default(0),
})

export type CustomPage = z.infer<typeof pageSchema>
