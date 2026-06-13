'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import { useAddExpense } from './queries'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']

export function QuickAdd({ onClose }: { onClose: () => void }) {
  const [raw, setRaw] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [note, setNote] = useState('')
  const addExpense = useAddExpense()

  const amountCents = Math.round(parseFloat(raw || '0') * 100)
  const canSave = amountCents > 0

  const press = (key: string) => {
    if (navigator.vibrate) navigator.vibrate(8)
    if (key === 'del') return setRaw((value) => value.slice(0, -1))
    if (key === '.' && raw.includes('.')) return
    if (raw.includes('.') && raw.split('.')[1]?.length >= 2) return
    setRaw((value) => (value === '0' && key !== '.' ? key : value + key))
  }

  const save = () => {
    if (!canSave) return
    addExpense.mutate({ amount: amountCents, category, note: note.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-5 pt-5">
        <button
          onClick={onClose}
          className="rounded-full px-3 py-2 text-sm text-zinc-400 active:bg-white/10"
        >
          Cancel
        </button>
        <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">
          New expense
        </span>
        <span className="w-14" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <span className="text-sm text-zinc-500">Amount</span>
        <span className="mt-2 text-6xl font-semibold tabular-nums text-zinc-50">
          {formatAmount(amountCents)}
        </span>

        <input
          name="note"
          aria-label="Note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a note (optional)"
          className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>

      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((item) => {
            const active = item.id === category
            return (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                style={active ? { backgroundColor: item.color, borderColor: item.color } : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                  active ? 'font-medium text-zinc-950' : 'border-white/10 bg-white/[0.04] text-zinc-300'
                }`}
              >
                <span>{item.emoji}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-white/5 pb-[env(safe-area-inset-bottom)]">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => press(key)}
            className="bg-zinc-950 py-5 text-2xl font-medium text-zinc-100 active:bg-white/10"
          >
            {key === 'del' ? '⌫' : key}
          </button>
        ))}
      </div>

      <button
        onClick={save}
        disabled={!canSave}
        className="m-4 rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-zinc-950 transition-opacity active:opacity-80 disabled:opacity-30"
      >
        Save expense
      </button>
    </div>
  )
}
