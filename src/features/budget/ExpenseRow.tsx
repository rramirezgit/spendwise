'use client'

import { useI18n, useMoney, type TKey } from '@/lib/i18n'
import { payerColor } from './colors'
import type { BudgetExpenseInfo, BudgetMember, Category } from './types'

export function payerLabel(
  expense: { payerId: string | null; splitPaid: boolean },
  members: BudgetMember[],
  currentUserId: string,
  t: (key: TKey) => string
): string {
  if (expense.splitPaid) return t('half_half_label')
  if (!expense.payerId) return t('unassigned')
  if (expense.payerId === currentUserId) return t('you')
  return members.find((member) => member.userId === expense.payerId)?.name ?? 'Member'
}

export function ExpenseRow({
  expense,
  members,
  categories,
  currentUserId,
  onTogglePaid,
  onCyclePayer,
  onEdit,
  onDelete,
}: {
  expense: BudgetExpenseInfo
  members: BudgetMember[]
  categories: Category[]
  currentUserId: string
  onTogglePaid: () => void
  onCyclePayer: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useI18n()
  const money = useMoney()
  const emoji = categories.find((category) => category.id === expense.category)?.emoji ?? '🏷️'
  const color = payerColor(expense, members)

  return (
    <li
      className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-colors ${
        expense.paid ? 'border-emerald-500/20 bg-emerald-500/[0.06]' : 'border-white/[0.05] bg-white/[0.02]'
      }`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <button
        onClick={onTogglePaid}
        aria-label={expense.paid ? t('pending') : t('paid')}
        aria-pressed={expense.paid}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors ${
          expense.paid
            ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
            : 'border-white/15 text-transparent active:bg-white/10'
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <button onClick={onEdit} className="block w-full truncate text-left text-sm text-zinc-100">
          {emoji} {expense.name}
        </button>
        <button
          onClick={onCyclePayer}
          className="mt-0.5 flex items-center gap-1.5 rounded-full text-xs text-zinc-400 active:opacity-70"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          {payerLabel(expense, members, currentUserId, t)}
          <span className="text-zinc-600">· {expense.paid ? t('paid') : t('pending')}</span>
        </button>
      </div>

      <button onClick={onEdit} className="text-sm font-medium tabular-nums text-zinc-100">
        {money(expense.amount)}
      </button>
      <button
        onClick={onDelete}
        aria-label={t('delete')}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
      >
        ✕
      </button>
    </li>
  )
}
