import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { CATEGORIES } from '@/lib/categories'

const schema = z.object({
  amount: z.number().int().positive(),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]),
  note: z.string().max(120).optional(),
})

export async function GET() {
  const userId = await getCurrentUserId()
  const items = await prisma.recurringExpense.findMany({
    where: { userId, active: true },
    orderBy: { amount: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid item' }, { status: 400 })

  const item = await prisma.recurringExpense.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(item, { status: 201 })
}
