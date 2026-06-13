'use client'

import { formatAmount, formatDayLabel } from '@/lib/format'
import { useIncomes, useDeleteIncome } from '../queries'

export function IncomeList() {
  const { data: items = [], isPending } = useIncomes()
  const remove = useDeleteIncome()

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">Loading…</p>

  if (items.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">💰</p>
        <p className="mt-3 text-sm text-zinc-500">No income yet. Add your salary or any earnings.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">Income</h2>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-lg">
              {item.recurring ? '🔁' : '💵'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-zinc-100">{item.source || 'Income'}</p>
              <p className="text-xs text-zinc-500">
                {item.recurring ? 'Every month' : formatDayLabel(item.receivedAt)}
              </p>
            </div>
            <span className="text-sm font-medium tabular-nums text-emerald-400">
              +{formatAmount(item.amount)}
            </span>
            <button
              onClick={() => remove.mutate(item.id)}
              aria-label="Delete income"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
