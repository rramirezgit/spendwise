import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

const createSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  name: z.string().min(1).max(80),
  amount: z.number().int().positive(),
  category: z.string().min(1).max(40),
  note: z.string().max(120).optional(),
  payerId: z.string().nullable().optional(),
  splitPaid: z.boolean().optional(),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid expense' }, { status: 400 })

  const { month, name, amount, category, note, payerId, splitPaid } = parsed.data
  const split = splitPaid ?? false

  const expense = await prisma.budgetExpense.create({
    data: {
      groupId,
      month,
      name,
      amount,
      category,
      note: note || null,
      payerId: split ? null : payerId ?? null,
      splitPaid: split,
      isFixed: false,
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
