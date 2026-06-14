import type { BudgetMember } from './types'

const PALETTE = ['#3b82f6', '#ec4899', '#22c55e', '#8b5cf6']
export const SPLIT_COLOR = '#f59e0b'
export const UNASSIGNED_COLOR = '#71717a'

export function memberColor(userId: string | null, members: BudgetMember[]): string {
  if (!userId) return UNASSIGNED_COLOR
  const index = members.findIndex((member) => member.userId === userId)
  return index >= 0 ? PALETTE[index % PALETTE.length] : UNASSIGNED_COLOR
}

export function payerColor(
  expense: { payerId: string | null; splitPaid: boolean },
  members: BudgetMember[]
): string {
  if (expense.splitPaid) return SPLIT_COLOR
  return memberColor(expense.payerId, members)
}

const CHART_PALETTE = [
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#ef4444',
  '#14b8a6',
  '#64748b',
  '#a3a3a3',
]

export function chartColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
