'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCategory } from '@/lib/categories'
import { formatAmount, formatMonthLabel } from '@/lib/format'
import { monthKey, shiftPeriod } from '@/lib/finance'
import {
  useGroup,
  useDeleteGroup,
  useUpdateGroupExpense,
  useDeleteGroupExpense,
  useCopyMonth,
} from './queries'
import { GroupExpenseSheet } from './GroupExpenseSheet'

export function GroupDetail({ id, currentUserId }: { id: string; currentUserId: string }) {
  const router = useRouter()
  const [anchor, setAnchor] = useState(() => new Date())
  const month = monthKey(anchor)
  const prevMonth = monthKey(shiftPeriod('month', anchor, -1))

  const { data: group, isPending } = useGroup(id, month)
  const update = useUpdateGroupExpense(id, month)
  const removeExpense = useDeleteGroupExpense(id, month)
  const copyMonth = useCopyMonth(id, month)
  const deleteGroup = useDeleteGroup()
  const [adding, setAdding] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  const yourTransfers = useMemo(
    () => group?.transfers.filter((t) => t.fromId === currentUserId || t.toId === currentUserId) ?? [],
    [group, currentUserId]
  )

  if (isPending || !group) {
    return <div className="flex min-h-dvh items-center justify-center text-2xl">👥</div>
  }

  const pending = group.total - group.paidTotal
  const progress = group.total > 0 ? (group.paidTotal / group.total) * 100 : 0

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-7 pb-28">
      <header className="flex items-center gap-3">
        <Link href="/groups" aria-label="Back" className="text-xl text-zinc-400 active:text-zinc-100">
          ‹
        </Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-xl">
          {group.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-50">{group.name}</h1>
          <p className="text-xs text-zinc-500">{group.members.map((m) => m.name).join(', ')}</p>
        </div>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 active:bg-white/5"
        >
          Invite
        </button>
      </header>

      {showInvite && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-zinc-500">Share this code so others can join:</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-white/[0.06] px-3 py-2 text-sm tracking-widest text-emerald-300">
              {group.inviteCode}
            </code>
            <button
              onClick={() => navigator.clipboard?.writeText(group.inviteCode)}
              className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-900 active:opacity-80"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => setAnchor((a) => shiftPeriod('month', a, -1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-300">{formatMonthLabel(anchor)}</span>
        <button
          onClick={() => setAnchor((a) => shiftPeriod('month', a, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ›
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Settlement</p>
        {yourTransfers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            {group.total === 0 ? 'No shared expenses yet this month.' : "You're all settled. 🎉"}
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {yourTransfers.map((t, index) => {
              const youPay = t.fromId === currentUserId
              return (
                <li key={index} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300">
                    {youPay ? (
                      <>
                        You owe <span className="font-medium text-zinc-100">{t.toName}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-100">{t.fromName}</span> owes you
                      </>
                    )}
                  </span>
                  <span className={`font-semibold tabular-nums ${youPay ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatAmount(t.amount)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        <div className="mt-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Paid {formatAmount(group.paidTotal)} / {formatAmount(group.total)}</span>
            {pending > 0 && <span>{formatAmount(pending)} pending</span>}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">Expenses</h2>
        <button
          onClick={() => setAdding(true)}
          className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 active:opacity-80"
        >
          ＋ Add
        </button>
      </div>

      {group.expenses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-zinc-500">Nothing this month.</p>
          <button
            onClick={() => copyMonth.mutate(prevMonth)}
            disabled={copyMonth.isPending}
            className="mt-3 rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 active:bg-white/5 disabled:opacity-40"
          >
            ⧉ Copy from {formatMonthLabel(shiftPeriod('month', anchor, -1))}
          </button>
        </div>
      ) : (
        <ul className="mt-3 space-y-1">
          {group.expenses.map((expense) => {
            const category = getCategory(expense.category)
            const youPaid = expense.payerId === currentUserId
            return (
              <li
                key={expense.id}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
                  expense.paid
                    ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                    : 'border-white/[0.05] bg-white/[0.02]'
                }`}
              >
                <button
                  onClick={() => update.mutate({ expenseId: expense.id, paid: !expense.paid })}
                  aria-label={expense.paid ? 'Mark as unpaid' : 'Mark as paid'}
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
                  <p className="truncate text-sm text-zinc-100">{expense.description}</p>
                  <p className="text-xs text-zinc-500">
                    {category.emoji} {youPaid ? 'You' : expense.payerName} paid · {expense.paid ? 'Paid' : 'Pending'}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums text-zinc-100">
                  {formatAmount(expense.amount)}
                </span>
                <button
                  onClick={() => removeExpense.mutate(expense.id)}
                  aria-label="Delete expense"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {group.ownerId === currentUserId && (
        <button
          onClick={() => {
            if (confirm('Delete this group for everyone?')) {
              deleteGroup.mutate(group.id, { onSuccess: () => router.push('/groups') })
            }
          }}
          className="mt-10 w-full rounded-xl border border-rose-500/20 py-2.5 text-xs text-rose-400/80 active:bg-rose-500/10"
        >
          Delete group
        </button>
      )}

      {adding && (
        <GroupExpenseSheet
          groupId={group.id}
          month={month}
          members={group.members}
          currentUserId={currentUserId}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  )
}
