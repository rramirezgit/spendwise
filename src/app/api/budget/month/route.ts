import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'
import { budgetBalances, simplifyDebts } from '@/lib/budget'

export async function GET(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const month = new URL(request.url).searchParams.get('month')
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
  }

  const [members, expenses, templateCount] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.budgetExpense.findMany({
      where: { groupId, month },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.fixedItem.count({ where: { groupId, archived: false } }),
  ])

  const memberIds = members.map((member) => member.userId)
  const nameOf = new Map(members.map((member) => [member.userId, member.user.name ?? 'Member']))

  const balances = budgetBalances(memberIds, expenses).map((balance) => ({
    ...balance,
    name: nameOf.get(balance.userId) ?? 'Member',
  }))
  const transfers = simplifyDebts(balances).map((transfer) => ({
    ...transfer,
    fromName: nameOf.get(transfer.fromId) ?? 'Member',
    toName: nameOf.get(transfer.toId) ?? 'Member',
  }))

  const serialize = (expense: (typeof expenses)[number]) => ({
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    note: expense.note,
    payerId: expense.payerId,
    splitPaid: expense.splitPaid,
    paid: expense.paid,
    paidAt: expense.paidAt,
    isFixed: expense.isFixed,
  })

  const fixed = expenses.filter((expense) => expense.isFixed).map(serialize)
  const extras = expenses.filter((expense) => !expense.isFixed).map(serialize)
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const paidTotal = expenses.filter((e) => e.paid).reduce((sum, e) => sum + e.amount, 0)

  return NextResponse.json({
    month,
    fixed,
    extras,
    balances,
    transfers,
    total,
    paidTotal,
    templateCount,
    fixedGenerated: fixed.length,
  })
}
