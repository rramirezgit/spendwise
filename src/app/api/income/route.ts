import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'

const schema = z.object({
  amount: z.number().int().positive(),
  source: z.string().max(120).optional(),
  recurring: z.boolean().optional(),
})

export async function GET() {
  const userId = await getCurrentUserId()
  const incomes = await prisma.income.findMany({
    where: { userId },
    orderBy: { receivedAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(incomes)
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid income' }, { status: 400 })

  const income = await prisma.income.create({ data: { ...parsed.data, userId } })
  return NextResponse.json(income, { status: 201 })
}
