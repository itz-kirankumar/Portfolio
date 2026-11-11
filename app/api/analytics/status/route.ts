import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
export const dynamic = 'force-dynamic'
export async function GET() {
  const session = await getServerSession(authOptions)
  return NextResponse.json({
    excluded: Boolean(session?.user?.isOwner),
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
