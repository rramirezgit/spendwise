'use client'

import { useState } from 'react'
import { useI18n, useMoney } from '@/lib/i18n'
import { useAddExtra, useUpdateExpense, useDeleteExpense, useCategories } from './queries'
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
  const { t } = useI18n()
  const money = useMoney()
  const { data: categories = [] } = useCategories()
  const addExtra = useAddExtra(month)
  const update = useUpdateExpense(month)
  const remove = useDeleteExpense(month)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<BudgetExpenseInfo | null>(null)

  const total = data.extras.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="px-5 pt-5 pb-28">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">{t('extras_title')}</h2>
        <span className="text-sm tabular-nums text-zinc-300">{money(total)}</span>
      </div>

      {data.extras.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-4xl">🛒</p>
          <p className="mt-3 text-sm text-zinc-500">{t('extras_empty')}</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {data.extras.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              members={members}
              categories={categories}
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
        ＋ {t('add_extra')}
      </button>

      {adding && (
        <AddExpenseSheet
          title={t('new_extra')}
          saveLabel={t('add_expense')}
          placeholder={t('extra_name_ph')}
          members={members}
          currentUserId={currentUserId}
          onClose={() => setAdding(false)}
          onSubmit={(draft) => addExtra.mutate({ ...draft, month })}
        />
      )}

      {editing && (
        <AddExpenseSheet
          title={t('edit_expense')}
          saveLabel={t('save_changes')}
          placeholder={t('name')}
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
