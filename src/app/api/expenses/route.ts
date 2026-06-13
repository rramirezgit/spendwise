import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { CATEGORIES } from '@/lib/categories'

const createSchema = z.object({
  amount: z.number().int().positive(),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]),
  note: z.string().max(120).optional(),
})

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { spentAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid expense' }, { status: 400 })
  }

  const expense = await prisma.expense.create({
    data: { ...parsed.data, userId },
  })
  return NextResponse.json(expense, { status: 201 })
}
