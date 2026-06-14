'use client'

import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { useI18n, useMoney } from '@/lib/i18n'
import { formatDayLabel } from '@/lib/format'
import { useDaily, useAddDaily, useDeleteDaily, useCategories } from './queries'
import { SheetShell, useAmount } from './keypad'
import { CategoryPicker, catLabel } from './CategoryPicker'
import { chartColor } from './colors'

export function ControlTab({ month }: { month: string }) {
  const { t, locale } = useI18n()
  const money = useMoney()
  const { data: items = [], isPending } = useDaily(month)
  const { data: categories = [] } = useCategories()
  const remove = useDeleteDaily(month)
  const [adding, setAdding] = useState(false)

  const { total, slices } = useMemo(() => {
    const byCategory = new Map<string, number>()
    let sum = 0
    for (const item of items) {
      sum += item.amount
      byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + item.amount)
    }
    const data = [...byCategory.entries()]
      .map(([categoryId, value]) => {
        const category = categories.find((c) => c.id === categoryId)
        return { id: categoryId, value, emoji: category?.emoji ?? '🏷️', name: category?.name ?? '?' }
      })
      .sort((a, b) => b.value - a.value)
      .map((slice, index) => ({ ...slice, color: chartColor(index) }))
    return { total: sum, slices: data }
  }, [items, categories])

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">{t('loading')}</p>

  return (
    <div className="px-5 pt-5 pb-28">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
        <p className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{t('this_month_spent')}</p>
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
                📊
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-4xl font-semibold tabular-nums text-zinc-50">{money(total)}</p>
            <p className="mt-1 text-xs text-zinc-500">{t('control_hint')}</p>
          </div>
        </div>

        {slices.length > 0 && (
          <ul className="mt-5 space-y-2.5 border-t border-white/[0.06] pt-4">
            {slices.map((slice) => {
              const pct = Math.round((slice.value / total) * 100)
              return (
                <li key={slice.id}>
                  <div className="flex items-center gap-2 text-sm">
                    <span>{slice.emoji}</span>
                    <span className="flex-1 truncate text-zinc-300">{catLabel(slice.name, t)}</span>
                    <span className="text-xs tabular-nums text-zinc-500">{pct}%</span>
                    <span className="w-24 text-right font-medium tabular-nums text-zinc-100">{money(slice.value)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: slice.color }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-4xl">🍔</p>
          <p className="mt-3 text-sm text-zinc-500">{t('no_daily')}</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-1">
          {items.map((item) => {
            const category = categories.find((c) => c.id === item.category)
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-lg">
                  {category?.emoji ?? '🏷️'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-zinc-100">
                    {item.note || (category ? catLabel(category.name, t) : '—')}
                  </p>
                  <p className="text-xs text-zinc-500">{formatDayLabel(item.spentAt, locale)}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-zinc-100">{money(item.amount)}</span>
                <button
                  onClick={() => remove.mutate(item.id)}
                  aria-label={t('delete')}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
                >
                  ✕
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        onClick={() => setAdding(true)}
        className="mt-4 w-full rounded-2xl border border-dashed border-white/15 py-3 text-sm text-zinc-300 active:bg-white/5"
      >
        ＋ {t('add_daily')}
      </button>

      {adding && <DailyExpenseSheet month={month} onClose={() => setAdding(false)} />}
    </div>
  )
}

function DailyExpenseSheet({ month, onClose }: { month: string; onClose: () => void }) {
  const { t } = useI18n()
  const { cents, press } = useAmount()
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('')
  const add = useAddDaily(month)

  return (
    <SheetShell
      title={t('new_daily')}
      onClose={onClose}
      cents={cents}
      accent="#10b981"
      onPress={press}
      canSave={cents > 0 && category.length > 0}
      saveLabel={t('add_daily')}
      onSave={() => {
        add.mutate({ amount: cents, category, note: note.trim() || undefined })
        onClose()
      }}
      fields={
        <input
          name="note"
          aria-label={t('name')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('daily_name_ph')}
          className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
        />
      }
      chips={<CategoryPicker value={category} onChange={setCategory} />}
    />
  )
}
