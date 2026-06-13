'use client'

import { useState } from 'react'
import { getCategory } from '@/lib/categories'
import { formatAmount, formatMonthLabel } from '@/lib/format'
import { monthKey, shiftPeriod } from '@/lib/finance'
import { useRecurring, useDeleteRecurring, useFixedPayments, useTogglePaid } from '../queries'

export function FixedList() {
  const [anchor, setAnchor] = useState(() => new Date())
  const month = monthKey(anchor)
  const { data: items = [], isPending } = useRecurring()
  const { data: payments = [] } = useFixedPayments(month)
  const remove = useDeleteRecurring()
  const toggle = useTogglePaid(month)

  const paidIds = new Set(payments.map((payment) => payment.recurringId))
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const paidItems = items.filter((item) => paidIds.has(item.id))
  const paidTotal = paidItems.reduce((sum, item) => sum + item.amount, 0)
  const pending = total - paidTotal
  const progress = total > 0 ? (paidTotal / total) * 100 : 0

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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setAnchor((a) => shiftPeriod('month', a, -1))}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-300">{formatMonthLabel(anchor)}</span>
        <button
          onClick={() => setAnchor((a) => shiftPeriod('month', a, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
        >
          ›
        </button>
      </div>

      <div className="mb-5 rounded-3xl border border-white/[0.07] bg-white/[0.03] p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">Paid this month</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-50">
              {formatAmount(paidTotal)}
              <span className="text-base font-normal text-zinc-600"> / {formatAmount(total)}</span>
            </p>
          </div>
          <span className="text-sm tabular-nums text-zinc-400">
            {paidItems.length}/{items.length}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {pending > 0 && (
          <p className="mt-2 text-xs text-zinc-500">{formatAmount(pending)} still pending</p>
        )}
      </div>

      <ul className="space-y-1">
        {items.map((item) => {
          const category = getCategory(item.category)
          const paid = paidIds.has(item.id)
          return (
            <li
              key={item.id}
              className={`group flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
                paid
                  ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                  : 'border-white/[0.05] bg-white/[0.02]'
              }`}
            >
              <button
                onClick={() => toggle.mutate({ recurringId: item.id, paid: !paid })}
                aria-label={paid ? 'Mark as unpaid' : 'Mark as paid'}
                aria-pressed={paid}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm transition-colors ${
                  paid
                    ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                    : 'border-white/15 text-transparent active:bg-white/10'
                }`}
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-100">{item.note || category.label}</p>
                <p className="text-xs text-zinc-500">
                  {category.emoji} {category.label} · {paid ? 'Paid' : 'Pending'}
                </p>
              </div>
              <span className="text-sm font-medium tabular-nums text-zinc-100">
                {formatAmount(item.amount)}
              </span>
              <button
                onClick={() => remove.mutate(item.id)}
                aria-label="Delete fixed expense"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
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
