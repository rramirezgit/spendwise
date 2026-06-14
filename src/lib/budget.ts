import { simplifyDebts, type Balance, type Transfer } from './groups'

export type { Balance, Transfer }
export { simplifyDebts }

export interface BudgetItem {
  amount: number
  payerId: string | null
  splitPaid: boolean
}

export function budgetBalances(memberIds: string[], items: BudgetItem[]): Balance[] {
  const count = memberIds.length
  const paid = new Map(memberIds.map((id) => [id, 0]))
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const fairShare = count > 0 ? total / count : 0

  for (const item of items) {
    if (item.splitPaid) {
      const per = item.amount / count
      for (const id of memberIds) paid.set(id, (paid.get(id) ?? 0) + per)
    } else if (item.payerId && paid.has(item.payerId)) {
      paid.set(item.payerId, (paid.get(item.payerId) ?? 0) + item.amount)
    }
  }

  return memberIds.map((userId) => {
    const memberPaid = Math.round(paid.get(userId) ?? 0)
    const owed = Math.round(fairShare)
    return { userId, paid: memberPaid, owed, net: memberPaid - owed }
  })
}
