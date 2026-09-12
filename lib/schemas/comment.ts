import { z } from 'zod'

export const commentSchema = z.object({
  postId: z.string().min(1),
  parentId: z.string().optional(),
  name: z.string().min(1).max(100),
  text: z.string().min(1).max(2000),
  createdAt: z.number().int().default(0),
  status: z.enum(['approved', 'pending']).default('approved'),
  likes: z.number().int().default(0),
})

export type Comment = z.infer<typeof commentSchema> & { id: string }
export const COMMENTS_COLLECTION = 'comments'