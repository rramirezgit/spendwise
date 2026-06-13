export interface Share {
  userId: string
  amount: number
}

export function splitEqually(amount: number, participantIds: string[]): Share[] {
  const count = participantIds.length
  if (count === 0) return []
  const base = Math.floor(amount / count)
  const remainder = amount - base * count
  return participantIds.map((userId, index) => ({
    userId,
    amount: base + (index < remainder ? 1 : 0),
  }))
}

export interface ExpenseInput {
  payerId: string
  amount: number
  shares: Share[]
}

export interface Balance {
  userId: string
  paid: number
  owed: number
  net: number
}

export function computeBalances(memberIds: string[], expenses: ExpenseInput[]): Balance[] {
  const paid = new Map<string, number>()
  const owed = new Map<string, number>()
  for (const id of memberIds) {
    paid.set(id, 0)
    owed.set(id, 0)
  }

  for (const expense of expenses) {
    paid.set(expense.payerId, (paid.get(expense.payerId) ?? 0) + expense.amount)
    for (const share of expense.shares) {
      owed.set(share.userId, (owed.get(share.userId) ?? 0) + share.amount)
    }
  }

  return memberIds.map((userId) => {
    const memberPaid = paid.get(userId) ?? 0
    const memberOwed = owed.get(userId) ?? 0
    return { userId, paid: memberPaid, owed: memberOwed, net: memberPaid - memberOwed }
  })
}

export interface Transfer {
  fromId: string
  toId: string
  amount: number
}

export function simplifyDebts(balances: Balance[]): Transfer[] {
  const debtors = balances
    .filter((balance) => balance.net < 0)
    .map((balance) => ({ id: balance.userId, amount: -balance.net }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = balances
    .filter((balance) => balance.net > 0)
    .map((balance) => ({ id: balance.userId, amount: balance.net }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: Transfer[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0) {
      transfers.push({ fromId: debtor.id, toId: creditor.id, amount })
    }

    debtor.amount -= amount
    creditor.amount -= amount
    if (debtor.amount === 0) debtorIndex += 1
    if (creditor.amount === 0) creditorIndex += 1
  }

  return transfers
}
