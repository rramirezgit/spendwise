'use client'

import { useMemo } from 'react'
import { getCategory } from '@/lib/categories'
import { formatAmount, formatDayLabel } from '@/lib/format'
import { useDeleteExpense } from './queries'
import type { Expense } from './types'

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const deleteExpense = useDeleteExpense()

  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const expense of expenses) {
      const day = expense.spentAt.slice(0, 10)
      const list = map.get(day) ?? []
      list.push(expense)
      map.set(day, list)
    }
    return [...map.entries()]
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">🧾</p>
        <p className="mt-3 text-sm text-zinc-500">No expenses yet. Tap + to add your first one.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      {groups.map(([day, items]) => {
        const dayTotal = items.reduce((sum, item) => sum + item.amount, 0)
        return (
          <div key={day} className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">
                {formatDayLabel(items[0].spentAt)}
              </h2>
              <span className="text-xs tabular-nums text-zinc-600">{formatAmount(dayTotal)}</span>
            </div>
            <ul className="space-y-1">
              {items.map((expense) => {
                const category = getCategory(expense.category)
                return (
                  <li
                    key={expense.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${category.color}22` }}
                    >
                      {category.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-100">{expense.note || category.label}</p>
                      <p className="text-xs text-zinc-500">{category.label}</p>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-zinc-100">
                      {formatAmount(expense.amount)}
                    </span>
                    <button
                      onClick={() => deleteExpense.mutate(expense.id)}
                      aria-label="Delete expense"
                      className="text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100 active:text-red-400"
                    >
                      ✕
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
