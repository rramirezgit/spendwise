'use client'

import { useState } from 'react'
import { formatAmount } from '@/lib/format'
import { useAddFixed, useGenerate, useUpdateExpense, useDeleteExpense } from './queries'
import { ExpenseRow } from './ExpenseRow'
import { AddExpenseSheet, type ExpenseDraft } from './AddExpenseSheet'
import type { BudgetExpenseInfo, BudgetMember, MonthData } from './types'

export function FixedTab({
  month,
  data,
  members,
  currentUserId,
}: {
  month: string
  data: MonthData
  members: BudgetMember[]
  currentUserId: string
}) {
  const addFixed = useAddFixed(month)
  const generate = useGenerate(month)
  const update = useUpdateExpense(month)
  const remove = useDeleteExpense(month)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<BudgetExpenseInfo | null>(null)

  const total = data.fixed.reduce((sum, item) => sum + item.amount, 0)
  const paid = data.fixed.filter((item) => item.paid).reduce((sum, item) => sum + item.amount, 0)
  const paidCount = data.fixed.filter((item) => item.paid).length
  const progress = total > 0 ? (paid / total) * 100 : 0

  return (
    <div className="px-5 pt-5 pb-28">
      {data.fixed.length > 0 && (
        <div className="mb-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Fixed paid</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-50">
            {formatAmount(paid)}
            <span className="text-base font-normal text-zinc-600"> / {formatAmount(total)}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {paidCount}/{data.fixed.length} paid
          </p>
        </div>
      )}

      {data.fixed.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-4xl">🔁</p>
          {data.templateCount > 0 ? (
            <>
              <p className="mt-3 text-sm text-zinc-500">Your fixed expenses aren&apos;t loaded for this month yet.</p>
              <button
                onClick={() => generate.mutate(undefined)}
                disabled={generate.isPending}
                className="mt-4 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
              >
                Load this month&apos;s fixed expenses
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              No fixed expenses yet. Add rent, utilities, subscriptions — they&apos;ll repeat every month.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-1">
          {data.fixed.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              members={members}
              currentUserId={currentUserId}
              onTogglePaid={() => update.mutate({ id: expense.id, paid: !expense.paid })}
              onEdit={() => setEditing(expense)}
              onDelete={() => remove.mutate(expense.id)}
            />
          ))}
        </ul>
      )}

      <button
        onClick={() => setAdding(true)}
        className="mt-4 w-full rounded-2xl border border-dashed border-white/15 py-3 text-sm text-zinc-300 active:bg-white/5"
      >
        ＋ Add fixed expense
      </button>

      {adding && (
        <AddExpenseSheet
          title="New fixed expense"
          saveLabel="Add fixed expense"
          placeholder="Name (e.g. Rent, Internet)"
          members={members}
          currentUserId={currentUserId}
          onClose={() => setAdding(false)}
          onSubmit={(draft) => addFixed.mutate({ ...draft, month })}
        />
      )}

      {editing && (
        <AddExpenseSheet
          title="Edit fixed expense"
          saveLabel="Save changes"
          placeholder="Name"
          members={members}
          currentUserId={currentUserId}
          initial={toDraft(editing)}
          onClose={() => setEditing(null)}
          onSubmit={(draft) =>
            update.mutate({
              id: editing.id,
              name: draft.name,
              amount: draft.amount,
              payerId: draft.payerId,
              splitPaid: draft.splitPaid,
            })
          }
        />
      )}
    </div>
  )
}

function toDraft(expense: BudgetExpenseInfo): ExpenseDraft {
  return {
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    payerId: expense.payerId,
    splitPaid: expense.splitPaid,
  }
}
