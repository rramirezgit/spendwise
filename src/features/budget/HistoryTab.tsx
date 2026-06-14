'use client'

import { formatAmount, formatMonthLabel } from '@/lib/format'
import { useHistory } from './queries'

function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return formatMonthLabel(new Date(year, m - 1, 1))
}

export function HistoryTab({ onPick }: { onPick: (month: string) => void }) {
  const { data: months = [], isPending } = useHistory()

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">Loading…</p>

  if (months.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">📅</p>
        <p className="mt-3 text-sm text-zinc-500">No history yet. Closed months will show up here.</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">History</h2>
      <ul className="space-y-2">
        {months.map((entry) => {
          const transfer = entry.transfers[0]
          return (
            <li key={entry.month}>
              <button
                onClick={() => onPick(entry.month)}
                className="w-full rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-left active:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-100">{monthLabel(entry.month)}</span>
                  <span className="text-sm tabular-nums text-zinc-300">{formatAmount(entry.total)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>{entry.count} expenses · paid {formatAmount(entry.paidTotal)}</span>
                  {transfer ? (
                    <span>
                      {transfer.fromName} → {transfer.toName} {formatAmount(transfer.amount)}
                    </span>
                  ) : (
                    <span>even</span>
                  )}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
