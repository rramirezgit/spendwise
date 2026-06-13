import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { computeBalances } from '@/lib/groups'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: 'desc' },
    include: {
      members: true,
      expenses: { include: { shares: true } },
    },
  })

  const summary = groups.map((group) => {
    const balances = computeBalances(
      group.members.map((member) => member.userId),
      group.expenses
    )
    const net = balances.find((balance) => balance.userId === userId)?.net ?? 0
    const total = group.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      id: group.id,
      name: group.name,
      emoji: group.emoji,
      inviteCode: group.inviteCode,
      memberCount: group.members.length,
      total,
      net,
    }
  })

  return NextResponse.json(summary)
}

const createSchema = z.object({
  name: z.string().min(1).max(40),
  emoji: z.string().max(8).optional(),
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid group' }, { status: 400 })

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      emoji: parsed.data.emoji || '🏠',
      inviteCode: randomBytes(4).toString('hex'),
      ownerId: userId,
      members: { create: { userId } },
    },
  })

  return NextResponse.json(group, { status: 201 })
}
