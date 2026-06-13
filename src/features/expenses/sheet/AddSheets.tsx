'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { formatAmount } from '@/lib/format'
import { installmentPerMonth } from '@/lib/finance'
import {
  useAddExpense,
  useAddIncome,
  useAddRecurring,
  useAddInstallment,
  useAddSaving,
} from '../queries'
import { SheetShell, CategoryChips, useAmount } from './primitives'
import type { SavingKind } from '../types'

export type SheetKind = 'expense' | 'income' | 'fixed' | 'installment' | 'savings'

const fieldClass =
  'mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none'

export function AddSheet({ kind, onClose }: { kind: SheetKind; onClose: () => void }) {
  if (kind === 'income') return <IncomeSheet onClose={onClose} />
  if (kind === 'fixed') return <FixedSheet onClose={onClose} />
  if (kind === 'installment') return <InstallmentSheet onClose={onClose} />
  if (kind === 'savings') return <SavingsSheet onClose={onClose} />
  return <ExpenseSheet onClose={onClose} />
}

function ExpenseSheet({ onClose }: { onClose: () => void }) {
  const { cents, press } = useAmount()
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [note, setNote] = useState('')
  const add = useAddExpense()

  return (
    <SheetShell
      title="New expense"
      onClose={onClose}
      cents={cents}
      accent="#f43f5e"
      onPress={press}
      canSave={cents > 0}
      saveLabel="Save expense"
      onSave={() => {
        add.mutate({ amount: cents, category, note: note.trim() || undefined })
        onClose()
      }}
      fields={
        <input
          name="note"
          aria-label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className={`${fieldClass} focus:border-rose-500/50`}
        />
      }
      chips={<CategoryChips value={category} onChange={setCategory} />}
    />
  )
}

function IncomeSheet({ onClose }: { onClose: () => void }) {
  const { cents, press } = useAmount()
  const [source, setSource] = useState('')
  const [recurring, setRecurring] = useState(true)
  const add = useAddIncome()

  return (
    <SheetShell
      title="New income"
      amountLabel="Income"
      onClose={onClose}
      cents={cents}
      accent="#10b981"
      onPress={press}
      canSave={cents > 0}
      saveLabel="Save income"
      onSave={() => {
        add.mutate({ amount: cents, source: source.trim() || undefined, recurring })
        onClose()
      }}
      fields={
        <>
          <input
            name="source"
            aria-label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Source (e.g. Salary)"
            className={`${fieldClass} focus:border-emerald-500/50`}
          />
          <button
            onClick={() => setRecurring((v) => !v)}
            className={`mt-3 flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
              recurring ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300' : 'border-white/10 text-zinc-400'
            }`}
          >
            <span>{recurring ? '🔁' : '➖'}</span>
            {recurring ? 'Every month' : 'One-off'}
          </button>
        </>
      }
    />
  )
}

function FixedSheet({ onClose }: { onClose: () => void }) {
  const { cents, press } = useAmount()
  const [category, setCategory] = useState(CATEGORIES[3].id)
  const [note, setNote] = useState('')
  const add = useAddRecurring()

  return (
    <SheetShell
      title="New fixed expense"
      amountLabel="Per month"
      onClose={onClose}
      cents={cents}
      accent="#8b5cf6"
      onPress={press}
      canSave={cents > 0}
      saveLabel="Save fixed expense"
      onSave={() => {
        add.mutate({ amount: cents, category, note: note.trim() || undefined })
        onClose()
      }}
      fields={
        <input
          name="note"
          aria-label="Name"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Name (e.g. Rent, Netflix)"
          className={`${fieldClass} focus:border-violet-500/50`}
        />
      }
      chips={<CategoryChips value={category} onChange={setCategory} />}
    />
  )
}

function InstallmentSheet({ onClose }: { onClose: () => void }) {
  const { cents, press } = useAmount()
  const [category, setCategory] = useState(CATEGORIES[6].id)
  const [description, setDescription] = useState('')
  const [count, setCount] = useState(3)
  const add = useAddInstallment()
  const perMonth = cents > 0 ? installmentPerMonth(cents, count) : 0

  return (
    <SheetShell
      title="New installment plan"
      amountLabel="Total amount"
      onClose={onClose}
      cents={cents}
      accent="#06b6d4"
      onPress={press}
      canSave={cents > 0 && description.trim().length > 0}
      saveLabel="Save plan"
      onSave={() => {
        add.mutate({ totalAmount: cents, count, category, description: description.trim() })
        onClose()
      }}
      fields={
        <>
          <input
            name="description"
            aria-label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you buy?"
            className={`${fieldClass} focus:border-cyan-500/50`}
          />
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setCount((c) => Math.max(2, c - 1))}
              className="h-9 w-9 rounded-full border border-white/15 text-lg text-zinc-200 active:bg-white/10"
            >
              −
            </button>
            <span className="tabular-nums text-zinc-200">{count} installments</span>
            <button
              onClick={() => setCount((c) => Math.min(60, c + 1))}
              className="h-9 w-9 rounded-full border border-white/15 text-lg text-zinc-200 active:bg-white/10"
            >
              +
            </button>
          </div>
          {perMonth > 0 && (
            <p className="mt-3 text-sm text-cyan-300">{formatAmount(perMonth)} / month</p>
          )}
        </>
      }
      chips={<CategoryChips value={category} onChange={setCategory} />}
    />
  )
}

function SavingsSheet({ onClose }: { onClose: () => void }) {
  const { cents, press } = useAmount()
  const [kind, setKind] = useState<SavingKind>('deposit')
  const [note, setNote] = useState('')
  const add = useAddSaving()
  const accent = kind === 'deposit' ? '#f59e0b' : '#f43f5e'

  return (
    <SheetShell
      title="Savings"
      amountLabel={kind === 'deposit' ? 'Deposit' : 'Withdraw'}
      onClose={onClose}
      cents={cents}
      accent={accent}
      onPress={press}
      canSave={cents > 0}
      saveLabel={kind === 'deposit' ? 'Add to savings' : 'Withdraw'}
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
            placeholder="Note (e.g. Emergency fund)"
            className={`${fieldClass} focus:border-amber-500/50`}
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setKind('deposit')}
              className={`rounded-full border px-4 py-2 text-sm ${
                kind === 'deposit'
                  ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                  : 'border-white/10 text-zinc-400'
              }`}
            >
              ＋ Deposit
            </button>
            <button
              onClick={() => setKind('withdraw')}
              className={`rounded-full border px-4 py-2 text-sm ${
                kind === 'withdraw'
                  ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                  : 'border-white/10 text-zinc-400'
              }`}
            >
              － Withdraw
            </button>
          </div>
        </>
      }
    />
  )
}
