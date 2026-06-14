import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })
  const { id } = await params

  const result = await prisma.category.deleteMany({ where: { id, groupId } })
  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
