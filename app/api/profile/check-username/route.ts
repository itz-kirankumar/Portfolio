// app/api/profile/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkUsernameAvailable } from '@/lib/firestore'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) return NextResponse.json({ available: false })

  // Basic validation
  if (username.length < 3 || username.length > 30) {
    return NextResponse.json({ available: false, reason: 'Must be 3-30 characters' })
  }
  if (!/^[a-z0-9_-]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'Only lowercase letters, numbers, - and _' })
  }

  const RESERVED = ['dashboard', 'login', 'api', 'admin', 'settings', 'profile', 'about']
  if (RESERVED.includes(username)) {
    return NextResponse.json({ available: false, reason: 'Reserved username' })
  }

  const available = await checkUsernameAvailable(username)
  return NextResponse.json({ available })
}