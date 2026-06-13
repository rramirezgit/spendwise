'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { CATEGORIES, getCategory } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import type { Expense } from './types'

export function Summary({ expenses }: { expenses: Expense[] }) {
  const { total, slices } = useMemo(() => {
    const now = new Date()
    const monthly = expenses.filter((expense) => {
      const date = new Date(expense.spentAt)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })

    const byCategory = new Map<string, number>()
    let sum = 0
    for (const expense of monthly) {
      sum += expense.amount
      byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount)
    }

    const data = CATEGORIES.map((category) => ({
      ...category,
      value: byCategory.get(category.id) ?? 0,
    })).filter((slice) => slice.value > 0)

    return { total: sum, slices: data }
  }, [expenses])

  return (
    <section className="px-5 pt-6">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">This month</p>
        <div className="mt-3 flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            {slices.length > 0 ? (
              <PieChart width={112} height={112}>
                <Pie data={slices} dataKey="value" innerRadius={38} outerRadius={56} stroke="none" paddingAngle={2}>
                  {slices.map((slice) => (
                    <Cell key={slice.id} fill={slice.color} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-white/10 text-2xl">
                💸
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-4xl font-semibold tabular-nums text-zinc-50">{formatAmount(total)}</p>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {slices.slice(0, 4).map((slice) => (
                <li key={slice.id} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slice.color }} />
                  {getCategory(slice.id).label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
