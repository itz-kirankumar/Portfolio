// app/api/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getBlocks, createBlock, updateBlock, deleteBlock, reorderBlocks } from '@/lib/firestore'

// GET /api/blocks — fetch all blocks for logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const blocks = await getBlocks(session.user.id)
  return NextResponse.json({ blocks })
}

// POST /api/blocks — create a new block
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = await createBlock(session.user.id, body)
  return NextResponse.json({ id })
}

// PUT /api/blocks — update a block OR reorder
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Reorder mode: { reorder: true, blocks: [{id, order}] }
  if (body.reorder) {
    await reorderBlocks(session.user.id, body.blocks)
    return NextResponse.json({ ok: true })
  }

  // Update single block: { id, ...data }
  const { id, ...data } = body
  await updateBlock(session.user.id, id, data)
  return NextResponse.json({ ok: true })
}

// DELETE /api/blocks?id=xxx
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await deleteBlock(session.user.id, id)
  return NextResponse.json({ ok: true })
}