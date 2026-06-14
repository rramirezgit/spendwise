'use client'

import { useState } from 'react'
import { useI18n, useMoney } from '@/lib/i18n'
import { formatDayLabel } from '@/lib/format'
import { useSavings, useAddSaving, useDeleteSaving } from './queries'
import { SheetShell, useAmount } from './keypad'
import type { SavingInfo } from './types'

export function SavingsTab() {
  const { t, locale } = useI18n()
  const money = useMoney()
  const { data: items = [], isPending } = useSavings()
  const remove = useDeleteSaving()
  const [adding, setAdding] = useState(false)

  const total = items.reduce((sum, item) => sum + (item.kind === 'withdraw' ? -item.amount : item.amount), 0)
  const deposited = items.filter((i) => i.kind === 'deposit').reduce((s, i) => s + i.amount, 0)
  const withdrawn = items.filter((i) => i.kind === 'withdraw').reduce((s, i) => s + i.amount, 0)

  if (isPending) return <p className="px-5 pt-8 text-center text-sm text-zinc-600">{t('loading')}</p>

  return (
    <div className="px-5 pt-5 pb-28">
      <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[0.06] p-6">
        <p className="text-xs font-medium tracking-widest text-amber-500/80 uppercase">{t('joint_savings')}</p>
        <p className="mt-2 text-5xl font-semibold tabular-nums text-amber-300">{money(total)}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-amber-500/10 pt-3 text-xs text-zinc-500">
          <span>{t('deposited', { amount: money(deposited) })}</span>
          <span>· {t('withdrawn', { amount: money(withdrawn) })}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-4xl">🐷</p>
          <p className="mt-3 text-sm text-zinc-500">{t('savings_empty')}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-1">
          {items.map((item) => {
            const withdraw = item.kind === 'withdraw'
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
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
                    {item.note || (withdraw ? t('withdrawal') : t('deposit'))}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDayLabel(item.savedAt, locale)}
                    {item.byName ? ` · ${item.byName}` : ''}
                  </p>
                </div>
                <span className={`text-sm font-medium tabular-nums ${withdraw ? 'text-rose-400' : 'text-amber-300'}`}>
                  {withdraw ? '−' : '+'}
                  {money(item.amount)}
                </span>
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
        ＋ {t('add_savings')}
      </button>

      {adding && <SavingSheet onClose={() => setAdding(false)} />}
    </div>
  )
}

function SavingSheet({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  const { cents, press } = useAmount()
  const [kind, setKind] = useState<SavingInfo['kind']>('deposit')
  const [note, setNote] = useState('')
  const add = useAddSaving()
  const accent = kind === 'deposit' ? '#f59e0b' : '#f43f5e'

  return (
    <SheetShell
      title={t('savings_title')}
      amountLabel={kind === 'deposit' ? t('deposit_label') : t('withdraw_label')}
      onClose={onClose}
      cents={cents}
      accent={accent}
      onPress={press}
      canSave={cents > 0}
      saveLabel={kind === 'deposit' ? t('add_to_savings') : t('withdraw_label')}
      onSave={() => {
        add.mutate({ amount: cents, kind, note: note.trim() || undefined })
        onClose()
      }}
      fields={
        <>
          <input
            name="note"
            aria-label="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('savings_note_ph')}
            className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setKind('deposit')}
              className={`rounded-full border px-4 py-2 text-sm ${
                kind === 'deposit' ? 'border-amber-500 bg-amber-500/15 text-amber-300' : 'border-white/10 text-zinc-400'
              }`}
            >
              {t('deposit_btn')}
            </button>
            <button
              onClick={() => setKind('withdraw')}
              className={`rounded-full border px-4 py-2 text-sm ${
                kind === 'withdraw' ? 'border-rose-500 bg-rose-500/15 text-rose-300' : 'border-white/10 text-zinc-400'
              }`}
            >
              {t('withdraw_btn')}
            </button>
          </div>
        </>
      }
    />
  )
}
