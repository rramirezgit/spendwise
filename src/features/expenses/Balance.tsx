'use client'

import { useMemo } from 'react'
import { formatAmount } from '@/lib/format'
import { isCurrentMonth, installmentChargedThisMonth } from '@/lib/finance'
import type { Expense, Income, RecurringExpense, Installment } from './types'

interface BalanceProps {
  expenses: Expense[]
  incomes: Income[]
  recurring: RecurringExpense[]
  installments: Installment[]
}

export function Balance({ expenses, incomes, recurring, installments }: BalanceProps) {
  const stats = useMemo(() => {
    const income = incomes
      .filter((item) => item.recurring || isCurrentMonth(item.receivedAt))
      .reduce((sum, item) => sum + item.amount, 0)

    const variable = expenses
      .filter((item) => isCurrentMonth(item.spentAt))
      .reduce((sum, item) => sum + item.amount, 0)

    const fixed = recurring.reduce((sum, item) => sum + item.amount, 0)

    const cuotas = installments.reduce(
      (sum, plan) => sum + installmentChargedThisMonth(plan),
      0
    )

    const spent = variable + fixed + cuotas
    return { income, variable, fixed, cuotas, spent, balance: income - spent }
  }, [expenses, incomes, recurring, installments])

  const positive = stats.balance >= 0

  return (
    <section className="px-5 pt-6">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
          Balance this month
        </p>
        <p
          className={`mt-2 text-5xl font-semibold tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {formatAmount(stats.balance)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Income" value={stats.income} tone="text-emerald-400" />
          <Stat label="Spent" value={stats.spent} tone="text-zinc-200" />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-white/[0.06] pt-3 text-xs text-zinc-500">
          <span>Variable {formatAmount(stats.variable)}</span>
          <span>· Fixed {formatAmount(stats.fixed)}</span>
          <span>· Installments {formatAmount(stats.cuotas)}</span>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${tone}`}>{formatAmount(value)}</p>
    </div>
  )
}
