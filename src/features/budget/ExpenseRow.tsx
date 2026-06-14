'use client'

import { getCategory } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import type { BudgetExpenseInfo, BudgetMember } from './types'

export function payerLabel(
  expense: { payerId: string | null; splitPaid: boolean },
  members: BudgetMember[],
  currentUserId: string
): string {
  if (expense.splitPaid) return 'Half & half'
  if (!expense.payerId) return 'Unassigned'
  if (expense.payerId === currentUserId) return 'You'
  return members.find((member) => member.userId === expense.payerId)?.name ?? 'Member'
}

export function ExpenseRow({
  expense,
  members,
  currentUserId,
  onTogglePaid,
  onEdit,
  onDelete,
}: {
  expense: BudgetExpenseInfo
  members: BudgetMember[]
  currentUserId: string
  onTogglePaid: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const category = getCategory(expense.category)

  return (
    <li
      className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-colors ${
        expense.paid ? 'border-emerald-500/20 bg-emerald-500/[0.06]' : 'border-white/[0.05] bg-white/[0.02]'
      }`}
    >
      <button
        onClick={onTogglePaid}
        aria-label={expense.paid ? 'Mark as pending' : 'Mark as paid'}
        aria-pressed={expense.paid}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors ${
          expense.paid
            ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
            : 'border-white/15 text-transparent active:bg-white/10'
        }`}
      >
        ✓
      </button>

      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm text-zinc-100">{expense.name}</p>
        <p className="truncate text-xs text-zinc-500">
          {category.emoji} {payerLabel(expense, members, currentUserId)} · {expense.paid ? 'Paid' : 'Pending'}
        </p>
      </button>

      <button onClick={onEdit} className="text-sm font-medium tabular-nums text-zinc-100">
        {formatAmount(expense.amount)}
      </button>
      <button
        onClick={onDelete}
        aria-label="Delete"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
      >
        ✕
      </button>
    </li>
  )
}
