'use client'

import { getCategory } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import { useRecurring, useDeleteRecurring } from '../queries'

export function FixedList() {
  const { data: items = [], isPending } = useRecurring()
  const remove = useDeleteRecurring()
  const total = items.reduce((sum, item) => sum + item.amount, 0)

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">Loading…</p>

  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">🔁</p>
        <p className="mt-3 text-sm text-zinc-500">
          No fixed expenses yet. Add rent, subscriptions or any monthly bill.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-medium tracking-wider text-zinc-500 uppercase">Monthly fixed</h2>
        <span className="text-sm tabular-nums text-zinc-300">{formatAmount(total)}/mo</span>
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const category = getCategory(item.category)
          return (
            <li
              key={item.id}
              className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${category.color}22` }}
              >
                {category.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-100">{item.note || category.label}</p>
                <p className="text-xs text-zinc-500">{category.label} · every month</p>
              </div>
              <span className="text-sm font-medium tabular-nums text-zinc-100">
                {formatAmount(item.amount)}
              </span>
              <button
                onClick={() => remove.mutate(item.id)}
                aria-label="Delete fixed expense"
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
}
