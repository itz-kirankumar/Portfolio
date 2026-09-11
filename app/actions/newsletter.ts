'use server'

import { createStrict } from '@/lib/store'
import { SUBSCRIBERS_COLLECTION, subscriberSchema } from '@/lib/schemas/subscriber'

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) {
    return { error: 'Please provide a valid email.' }
  }

  // Generate a random ID for the subscriber or use their email hash
  // For simplicity, we'll use a random UUID or just use crypto.randomUUID
  const id = crypto.randomUUID()

  try {
    await createStrict(SUBSCRIBERS_COLLECTION, id, subscriberSchema, {
      email,
      name: '',
      status: 'active',
      tags: ['website_widget'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return { success: true }
  } catch (err) {
    console.error('Subscription error:', err)
    return { error: 'Failed to subscribe. You might already be subscribed!' }
  }
}
