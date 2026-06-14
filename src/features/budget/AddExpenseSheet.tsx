'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { SheetShell, useAmount } from './keypad'
import { CategoryPicker } from './CategoryPicker'
import type { BudgetMember } from './types'

const fieldClass =
  'mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50'

export interface ExpenseDraft {
  name: string
  amount: number
  category: string
  payerId: string | null
  splitPaid: boolean
}

export function AddExpenseSheet({
  title,
  saveLabel,
  placeholder,
  members,
  currentUserId,
  initial,
  onClose,
  onSubmit,
}: {
  title: string
  saveLabel: string
  placeholder: string
  members: BudgetMember[]
  currentUserId: string
  initial?: ExpenseDraft
  onClose: () => void
  onSubmit: (draft: ExpenseDraft) => void
}) {
  const { t } = useI18n()
  const { cents, press } = useAmount(initial ? (initial.amount / 100).toString() : '')
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [payer, setPayer] = useState<string>(
    initial ? (initial.splitPaid ? 'split' : initial.payerId ?? currentUserId) : currentUserId
  )

  const label = (member: BudgetMember) => (member.userId === currentUserId ? t('you') : member.name)

  return (
    <SheetShell
      title={title}
      onClose={onClose}
      cents={cents}
      accent="#10b981"
      onPress={press}
      canSave={cents > 0 && name.trim().length > 0 && category.length > 0}
      saveLabel={saveLabel}
      onSave={() => {
        onSubmit({
          name: name.trim(),
          amount: cents,
          category,
          payerId: payer === 'split' ? null : payer,
          splitPaid: payer === 'split',
        })
        onClose()
      }}
      fields={
        <>
          <input
            name="name"
            aria-label={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            className={fieldClass}
          />
          <div className="mt-5 w-full max-w-xs">
            <p className="mb-2 text-xs text-zinc-500">{t('who_pays')}</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <button
                  key={member.userId}
                  onClick={() => setPayer(member.userId)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    payer === member.userId
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/10 text-zinc-400'
                  }`}
                >
                  {label(member)}
                </button>
              ))}
              <button
                onClick={() => setPayer('split')}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  payer === 'split'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300'
                    : 'border-white/10 text-zinc-400'
                }`}
              >
                {t('half_half')}
              </button>
            </div>
          </div>
        </>
      }
      chips={<CategoryPicker value={category} onChange={setCategory} />}
    />
  )
}
