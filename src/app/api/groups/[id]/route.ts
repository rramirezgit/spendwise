import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { computeBalances, simplifyDebts } from '@/lib/groups'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const month = new URL(request.url).searchParams.get('month')
  const monthFilter = month && /^\d{4}-\d{2}$/.test(month) ? { month } : {}

  const group = await prisma.group.findFirst({
    where: { id, members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      expenses: {
        where: monthFilter,
        orderBy: { spentAt: 'desc' },
        include: {
          shares: true,
          payer: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const memberIds = group.members.map((member) => member.userId)
  const nameOf = new Map(group.members.map((member) => [member.userId, member.user.name ?? 'Member']))

  const balances = computeBalances(memberIds, group.expenses).map((balance) => ({
    ...balance,
    name: nameOf.get(balance.userId) ?? 'Member',
  }))

  const transfers = simplifyDebts(balances).map((transfer) => ({
    ...transfer,
    fromName: nameOf.get(transfer.fromId) ?? 'Member',
    toName: nameOf.get(transfer.toId) ?? 'Member',
  }))

  return NextResponse.json({
    id: group.id,
    name: group.name,
    emoji: group.emoji,
    inviteCode: group.inviteCode,
    ownerId: group.ownerId,
    members: group.members.map((member) => ({
      userId: member.userId,
      name: member.user.name ?? 'Member',
      image: member.user.image,
    })),
    expenses: group.expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      month: expense.month,
      paid: expense.paid,
      spentAt: expense.spentAt,
      payerId: expense.payerId,
      payerName: expense.payer.name ?? 'Member',
      shares: expense.shares.map((share) => ({ userId: share.userId, amount: share.amount })),
    })),
    balances,
    transfers,
    total: group.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    paidTotal: group.expenses
      .filter((expense) => expense.paid)
      .reduce((sum, expense) => sum + expense.amount, 0),
  })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const result = await prisma.group.deleteMany({ where: { id, ownerId: userId } })
  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found or not owner' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
