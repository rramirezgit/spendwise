'use client'

import { getCategory } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import { installmentPerMonth, installmentPaidCount } from '@/lib/finance'
import { useInstallments, useDeleteInstallment } from '../queries'

export function InstallmentList() {
  const { data: plans = [], isPending } = useInstallments()
  const remove = useDeleteInstallment()

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">Loading…</p>

  if (plans.length === 0) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-4xl">💳</p>
        <p className="mt-3 text-sm text-zinc-500">
          No installment plans. Add a purchase split into monthly payments.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <h2 className="mb-3 text-xs font-medium tracking-wider text-zinc-500 uppercase">
        Installment plans
      </h2>
      <ul className="space-y-3">
        {plans.map((plan) => {
          const category = getCategory(plan.category)
          const perMonth = installmentPerMonth(plan.totalAmount, plan.count)
          const paid = installmentPaidCount(plan)
          const remaining = Math.max(plan.totalAmount - paid * perMonth, 0)
          const progress = (paid / plan.count) * 100
          return (
            <li
              key={plan.id}
              className="group rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ backgroundColor: `${category.color}22` }}
                >
                  {category.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">{plan.description}</p>
                  <p className="text-xs text-zinc-500">
                    {formatAmount(perMonth)}/mo · {paid} of {plan.count} paid
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums text-zinc-100">
                    {formatAmount(remaining)}
                  </p>
                  <p className="text-xs text-zinc-600">left</p>
                </div>
                <button
                  onClick={() => remove.mutate(plan.id)}
                  aria-label="Delete plan"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, backgroundColor: category.color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
