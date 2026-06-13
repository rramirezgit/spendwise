'use client'

import { formatAmount, formatDayLabel } from '@/lib/format'
import { useSavings, useDeleteSaving } from '../queries'

export function SavingsList() {
  const { data: items = [], isPending } = useSavings()
  const remove = useDeleteSaving()

  const total = items.reduce(
    (sum, item) => sum + (item.kind === 'withdraw' ? -item.amount : item.amount),
    0
  )
  const deposited = items
    .filter((item) => item.kind === 'deposit')
    .reduce((sum, item) => sum + item.amount, 0)
  const withdrawn = items
    .filter((item) => item.kind === 'withdraw')
    .reduce((sum, item) => sum + item.amount, 0)

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">Loading…</p>

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-6">
        <p className="text-xs font-medium tracking-widest text-amber-500/80 uppercase">Total saved</p>
        <p className="mt-2 text-5xl font-semibold tabular-nums text-amber-300">{formatAmount(total)}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-500/10 pt-3 text-xs text-zinc-500">
          <span>Deposited {formatAmount(deposited)}</span>
          <span>· Withdrawn {formatAmount(withdrawn)}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">🐷</p>
          <p className="mt-3 text-sm text-zinc-500">
            No savings yet. Tap + and pick Savings to start your fund.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-1">
          {items.map((item) => {
            const withdraw = item.kind === 'withdraw'
            return (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                    withdraw ? 'bg-rose-500/15' : 'bg-amber-500/15'
                  }`}
                >
                  {withdraw ? '↗️' : '🐷'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">
                    {item.note || (withdraw ? 'Withdrawal' : 'Deposit')}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDayLabel(item.savedAt)}</p>
                </div>
                <span
                  className={`text-sm font-medium tabular-nums ${withdraw ? 'text-rose-400' : 'text-amber-300'}`}
                >
                  {withdraw ? '−' : '+'}
                  {formatAmount(item.amount)}
                </span>
                <button
                  onClick={() => remove.mutate(item.id)}
                  aria-label="Delete saving"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
