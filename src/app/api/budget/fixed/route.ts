import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'
import { CATEGORIES } from '@/lib/categories'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json([])

  const items = await prisma.fixedItem.findMany({
    where: { groupId, archived: false },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(items)
}

const createSchema = z.object({
  name: z.string().min(1).max(60),
  amount: z.number().int().positive(),
  category: z.enum(CATEGORIES.map((category) => category.id) as [string, ...string[]]),
  payerId: z.string().nullable().optional(),
  splitPaid: z.boolean().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid fixed item' }, { status: 400 })

  const { name, amount, category, payerId, splitPaid, month } = parsed.data
  const split = splitPaid ?? false

  const count = await prisma.fixedItem.count({ where: { groupId } })
  const item = await prisma.fixedItem.create({
    data: {
      groupId,
      name,
      amount,
      category,
      payerId: split ? null : payerId ?? null,
      splitPaid: split,
      sortOrder: count,
    },
  })

  await prisma.budgetExpense.create({
    data: {
      groupId,
      month,
      name,
      amount,
      category,
      payerId: split ? null : payerId ?? null,
      splitPaid: split,
      isFixed: true,
      fixedItemId: item.id,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
