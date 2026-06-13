'use client'

import { periodRange, shiftPeriod, type PeriodKind } from '@/lib/finance'
import { formatDayLabel, formatMonthLabel } from '@/lib/format'

export interface Period {
  kind: PeriodKind
  anchor: Date
}

const KINDS: { id: PeriodKind; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

function label({ kind, anchor }: Period): string {
  if (kind === 'month') return formatMonthLabel(anchor)

  const { start, end } = periodRange(kind, anchor)
  if (kind === 'day') return formatDayLabel(start.toISOString())

  const last = new Date(end)
  last.setDate(last.getDate() - 1)
  const sameMonth = start.getMonth() === last.getMonth()
  const left = start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  const right = last.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' })
  return `${left} – ${right}`
}

export function PeriodBar({ period, onChange }: { period: Period; onChange: (next: Period) => void }) {
  return (
    <section className="px-5 pt-5">
      <div className="flex gap-1 rounded-full bg-white/[0.04] p-1">
        {KINDS.map((kind) => (
          <button
            key={kind.id}
            onClick={() => onChange({ kind: kind.id, anchor: period.anchor })}
            className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
              period.kind === kind.id ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
            }`}
          >
            {kind.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onChange({ kind: period.kind, anchor: shiftPeriod(period.kind, period.anchor, -1) })}
          aria-label="Previous period"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-300">{label(period)}</span>
        <button
          onClick={() => onChange({ kind: period.kind, anchor: shiftPeriod(period.kind, period.anchor, 1) })}
          aria-label="Next period"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ›
        </button>
      </div>
    </section>
  )
}
