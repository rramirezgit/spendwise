import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json([])

  const categories = await prisma.category.findMany({
    where: { groupId },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(categories.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji })))
}

const createSchema = z.object({
  name: z.string().min(1).max(24),
  emoji: z.string().min(1).max(8),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

  const count = await prisma.category.count({ where: { groupId } })
  const category = await prisma.category.create({
    data: { groupId, name: parsed.data.name, emoji: parsed.data.emoji, sortOrder: count },
  })
  return NextResponse.json({ id: category.id, name: category.name, emoji: category.emoji }, { status: 201 })
}
