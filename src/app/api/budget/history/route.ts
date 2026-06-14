import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'
import { budgetBalances, simplifyDebts } from '@/lib/budget'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json([])

  const [members, expenses] = await Promise.all([
    prisma.groupMember.findMany({
      where: { groupId },
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.budgetExpense.findMany({ where: { groupId } }),
  ])

  const memberIds = members.map((member) => member.userId)
  const nameOf = new Map(members.map((member) => [member.userId, member.user.name ?? 'Member']))

  const byMonth = new Map<string, typeof expenses>()
  for (const expense of expenses) {
    const list = byMonth.get(expense.month) ?? []
    list.push(expense)
    byMonth.set(expense.month, list)
  }

  const months = [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, items]) => {
      const balances = budgetBalances(memberIds, items)
      const transfers = simplifyDebts(balances).map((transfer) => ({
        ...transfer,
        fromName: nameOf.get(transfer.fromId) ?? 'Member',
        toName: nameOf.get(transfer.toId) ?? 'Member',
      }))
      return {
        month,
        total: items.reduce((sum, item) => sum + item.amount, 0),
        paidTotal: items.filter((item) => item.paid).reduce((sum, item) => sum + item.amount, 0),
        count: items.length,
        balances: balances.map((balance) => ({ ...balance, name: nameOf.get(balance.userId) ?? 'Member' })),
        transfers,
      }
    })

  return NextResponse.json(months)
}
