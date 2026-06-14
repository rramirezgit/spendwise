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

  const savings = await prisma.groupSaving.findMany({
    where: { groupId },
    orderBy: { savedAt: 'desc' },
    take: 200,
    include: { by: { select: { name: true } } },
  })

  return NextResponse.json(
    savings.map((saving) => ({
      id: saving.id,
      amount: saving.amount,
      kind: saving.kind,
      note: saving.note,
      savedAt: saving.savedAt,
      byName: saving.by?.name ?? null,
    }))
  )
}

const createSchema = z.object({
  amount: z.number().int().positive(),
  kind: z.enum(['deposit', 'withdraw']),
  note: z.string().max(120).optional(),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid saving' }, { status: 400 })

  const saving = await prisma.groupSaving.create({
    data: { ...parsed.data, groupId, byUserId: userId },
  })
  return NextResponse.json(saving, { status: 201 })
}
