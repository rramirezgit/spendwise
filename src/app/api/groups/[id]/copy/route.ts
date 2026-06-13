import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/)
const copySchema = z.object({ from: monthSchema, to: monthSchema })

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const member = await prisma.groupMember.findFirst({ where: { groupId: id, userId } })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const parsed = copySchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { from, to } = parsed.data
  const source = await prisma.groupExpense.findMany({
    where: { groupId: id, month: from },
    include: { shares: true },
  })

  if (source.length === 0) {
    return NextResponse.json({ copied: 0 })
  }

  await prisma.$transaction(
    source.map((expense) =>
      prisma.groupExpense.create({
        data: {
          groupId: id,
          payerId: expense.payerId,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          month: to,
          paid: false,
          shares: { create: expense.shares.map((share) => ({ userId: share.userId, amount: share.amount })) },
        },
      })
    )
  )

  return NextResponse.json({ copied: source.length })
}
