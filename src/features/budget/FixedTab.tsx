'use client'

import { useState } from 'react'
import { useI18n, useMoney } from '@/lib/i18n'
import { useAddFixed, useGenerate, useUpdateExpense, useDeleteExpense, useCategories } from './queries'
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
  const { t } = useI18n()
  const money = useMoney()
  const { data: categories = [] } = useCategories()
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
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{t('fixed_paid')}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-50">
            {money(paid)}
            <span className="text-base font-normal text-zinc-600"> / {money(total)}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-zinc-500">{t('paid_count', { n: paidCount, total: data.fixed.length })}</p>
        </div>
      )}

      {data.fixed.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-4xl">🔁</p>
          {data.templateCount > 0 ? (
            <>
              <p className="mt-3 text-sm text-zinc-500">{t('fixed_not_loaded')}</p>
              <button
                onClick={() => generate.mutate(undefined)}
                disabled={generate.isPending}
                className="mt-4 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
              >
                {t('fixed_load')}
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">{t('fixed_empty')}</p>
          )}
        </div>
      ) : (
        <ul className="space-y-1">
          {data.fixed.map((expense) => (
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
        ＋ {t('add_fixed')}
      </button>

      {adding && (
        <AddExpenseSheet
          title={t('new_fixed')}
          saveLabel={t('add_fixed')}
          placeholder={t('fixed_name_ph')}
          members={members}
          currentUserId={currentUserId}
          onClose={() => setAdding(false)}
          onSubmit={(draft) => addFixed.mutate({ ...draft, month })}
        />
      )}

      {editing && (
        <AddExpenseSheet
          title={t('edit_fixed')}
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
