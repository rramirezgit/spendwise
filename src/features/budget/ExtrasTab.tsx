'use client'

import { useState } from 'react'
import { formatAmount } from '@/lib/format'
import { useAddExtra, useUpdateExpense, useDeleteExpense } from './queries'
import { ExpenseRow } from './ExpenseRow'
import { AddExpenseSheet, type ExpenseDraft } from './AddExpenseSheet'
import type { BudgetExpenseInfo, BudgetMember, MonthData } from './types'

export function ExtrasTab({
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
  const addExtra = useAddExtra(month)
  const update = useUpdateExpense(month)
  const remove = useDeleteExpense(month)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<BudgetExpenseInfo | null>(null)

  const total = data.extras.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="px-5 pt-5 pb-28">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">Extra expenses</h2>
        <span className="text-sm tabular-nums text-zinc-300">{formatAmount(total)}</span>
      </div>

      {data.extras.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-4xl">🛒</p>
          <p className="mt-3 text-sm text-zinc-500">
            No extras this month. Add groceries, outings, repairs — anything outside the fixed bills.
          </p>
        </div>
      ) : (
        <ul className="space-y-1">
          {data.extras.map((expense) => (
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
        ＋ Add extra expense
      </button>

      {adding && (
        <AddExpenseSheet
          title="New extra expense"
          saveLabel="Add expense"
          placeholder="What was it? (e.g. Groceries)"
          members={members}
          currentUserId={currentUserId}
          defaultCategory="groceries"
          onClose={() => setAdding(false)}
          onSubmit={(draft) => addExtra.mutate({ ...draft, month })}
        />
      )}

      {editing && (
        <AddExpenseSheet
          title="Edit expense"
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
