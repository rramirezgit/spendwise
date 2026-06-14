'use client'

import { useI18n, useMoney } from '@/lib/i18n'
import { formatMonthLabel } from '@/lib/format'
import { useHistory } from './queries'

export function HistoryTab({ onPick }: { onPick: (month: string) => void }) {
  const { t, locale } = useI18n()
  const money = useMoney()
  const { data: months = [], isPending } = useHistory()

  const monthLabel = (month: string) => {
    const [year, m] = month.split('-').map(Number)
    return formatMonthLabel(new Date(year, m - 1, 1), locale)
  }

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">{t('loading')}</p>

  if (months.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">📅</p>
        <p className="mt-3 text-sm text-zinc-500">{t('history_empty')}</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">{t('history_title')}</h2>
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
                  <span className="text-sm tabular-nums text-zinc-300">{money(entry.total)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                  <span>{t('history_line', { count: entry.count, amount: money(entry.paidTotal) })}</span>
                  {transfer ? (
                    <span>
                      {transfer.fromName} → {transfer.toName} {money(transfer.amount)}
                    </span>
                  ) : (
                    <span>{t('even')}</span>
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
