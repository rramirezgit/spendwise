'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { CATEGORIES, getCategory } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import type { Expense } from './types'

export function Summary({ expenses }: { expenses: Expense[] }) {
  const { total, slices } = useMemo(() => {
    const byCategory = new Map<string, number>()
    let sum = 0
    for (const expense of expenses) {
      sum += expense.amount
      byCategory.set(expense.category, (byCategory.get(expense.category) ?? 0) + expense.amount)
    }

    const data = CATEGORIES.map((category) => ({
      ...category,
      value: byCategory.get(category.id) ?? 0,
    }))
      .filter((slice) => slice.value > 0)
      .sort((a, b) => b.value - a.value)

    return { total: sum, slices: data }
  }, [expenses])

  return (
    <section className="px-5 pt-6">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Spent</p>
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
            <p className="mt-1 text-xs text-zinc-500">
              {slices.length} {slices.length === 1 ? 'category' : 'categories'}
            </p>
          </div>
        </div>

        {slices.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-4">
            {slices.map((slice) => {
              const category = getCategory(slice.id)
              const pct = Math.round((slice.value / total) * 100)
              return (
                <li key={slice.id} className="flex items-center gap-3 text-sm">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: `${slice.color}22` }}
                  >
                    {category.emoji}
                  </span>
                  <span className="flex-1 truncate text-zinc-300">{category.label}</span>
                  <span className="w-9 text-right text-xs tabular-nums text-zinc-500">{pct}%</span>
                  <span className="w-20 text-right font-medium tabular-nums text-zinc-100">
                    {formatAmount(slice.value)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
