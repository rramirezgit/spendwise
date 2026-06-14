'use client'

import { formatAmount } from '@/lib/format'
import type { BudgetMember, MonthData } from './types'

export function BalanceTab({
  data,
  currentUserId,
}: {
  data: MonthData
  members: BudgetMember[]
  currentUserId: string
}) {
  const pending = data.total - data.paidTotal
  const progress = data.total > 0 ? (data.paidTotal / data.total) * 100 : 0

  return (
    <div className="px-5 pt-5 pb-28">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Month total</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums text-zinc-50">{formatAmount(data.total)}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {data.balances.map((balance) => (
            <div key={balance.userId} className="rounded-2xl bg-white/[0.03] px-4 py-3">
              <p className="truncate text-xs text-zinc-500">
                {balance.userId === currentUserId ? 'You' : balance.name}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-100">
                {formatAmount(balance.paid)}
              </p>
              <p className="text-[11px] text-zinc-600">of {formatAmount(balance.owed)} fair share</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">To settle up</p>
        {data.transfers.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            {data.total === 0 ? 'No expenses yet this month.' : 'Even — nobody owes anything. 🎉'}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.transfers.map((transfer, index) => (
              <li key={index} className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">
                  <span className="font-medium text-zinc-100">
                    {transfer.fromId === currentUserId ? 'You' : transfer.fromName}
                  </span>{' '}
                  →{' '}
                  <span className="font-medium text-zinc-100">
                    {transfer.toId === currentUserId ? 'You' : transfer.toName}
                  </span>
                </span>
                <span className="text-lg font-semibold tabular-nums text-emerald-400">
                  {formatAmount(transfer.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Paid {formatAmount(data.paidTotal)}</span>
          {pending > 0 ? (
            <span className="text-amber-300">{formatAmount(pending)} pending</span>
          ) : (
            <span className="text-emerald-400">All paid</span>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
