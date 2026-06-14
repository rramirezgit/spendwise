'use client'

import { useState } from 'react'
import { useI18n, useMoney } from '@/lib/i18n'
import { useAddFixed, useGenerate, useUpdateExpense, useDeleteExpense, useCategories } from './queries'
import { ExpenseRow } from './ExpenseRow'
import { AddExpenseSheet, type ExpenseDraft } from './AddExpenseSheet'
import { memberColor } from './colors'
import type { BudgetExpenseInfo, BudgetMember, MonthData } from './types'

function nextPayer(expense: BudgetExpenseInfo, members: BudgetMember[]) {
  const order = [
    ...members.map((member) => ({ payerId: member.userId as string | null, splitPaid: false })),
    { payerId: null as string | null, splitPaid: true },
  ]
  const index = expense.splitPaid
    ? order.length - 1
    : order.findIndex((option) => option.payerId === expense.payerId)
  return order[(index + 1) % order.length]
}

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
  const progress = total > 0 ? (paid / total) * 100 : 0

  return (
    <div className="px-5 pt-5 pb-28">
      {data.fixed.length > 0 && (
        <div className="mb-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
          <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{t('month_total')}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-50">{money(total)}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.balances.map((balance) => (
              <div key={balance.userId} className="rounded-2xl bg-white/[0.03] px-3 py-2.5">
                <p className="flex items-center gap-1.5 truncate text-xs text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: memberColor(balance.userId, members) }} />
                  {balance.userId === currentUserId ? t('you') : balance.name}
                </p>
                <p className="mt-0.5 text-base font-semibold tabular-nums text-zinc-100">{money(balance.paid)}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-white/[0.06] pt-3 text-sm">
            {data.transfers.length === 0 ? (
              <p className="text-zinc-400">{total === 0 ? t('no_expenses') : t('all_even')}</p>
            ) : (
              data.transfers.map((transfer, index) => (
                <p key={index} className="flex items-center justify-between">
                  <span className="text-zinc-300">
                    <span className="font-medium text-zinc-100">
                      {transfer.fromId === currentUserId ? t('you') : transfer.fromName}
                    </span>{' '}
                    →{' '}
                    <span className="font-medium text-zinc-100">
                      {transfer.toId === currentUserId ? t('you') : transfer.toName}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-400">{money(transfer.amount)}</span>
                </p>
              ))
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>{t('paid_amount', { amount: money(paid) })}</span>
            {total - paid > 0 && <span>{t('pending_amount', { amount: money(total - paid) })}</span>}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
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
              onCyclePayer={() => update.mutate({ id: expense.id, ...nextPayer(expense, members) })}
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
