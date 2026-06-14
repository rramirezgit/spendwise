import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

export async function GET(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json([])

  const month = new URL(request.url).searchParams.get('month')
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
  }

  const items = await prisma.dailyExpense.findMany({
    where: { groupId, userId, month },
    orderBy: { spentAt: 'desc' },
  })
  return NextResponse.json(items)
}

const createSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().int().positive(),
  category: z.string().min(1).max(40),
  note: z.string().max(120).optional(),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid expense' }, { status: 400 })

  const item = await prisma.dailyExpense.create({
    data: {
      groupId,
      userId,
      month: parsed.data.month,
      amount: parsed.data.amount,
      category: parsed.data.category,
      note: parsed.data.note || null,
    },
  })
  return NextResponse.json(item, { status: 201 })
}
