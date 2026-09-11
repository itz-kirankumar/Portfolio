import { z } from 'zod'

export const ANALYTICS_COLLECTION = 'analytics'

export const analyticsSchema = z.object({
  id: z.string().optional(),
  path: z.string(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  timestamp: z.number()
})

export type AnalyticsEvent = z.infer<typeof analyticsSchema>
