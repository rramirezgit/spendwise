import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { CATEGORIES } from '@/lib/categories'

const schema = z.object({
  description: z.string().min(1).max(120),
  totalAmount: z.number().int().positive(),
  count: z.number().int().min(2).max(60),
  category: z.enum(CATEGORIES.map((c) => c.id) as [string, ...string[]]),
})

export async function GET() {
  const userId = await getCurrentUserId()
  const plans = await prisma.installment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(plans)
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const plan = await prisma.installment.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(plan, { status: 201 })
}
