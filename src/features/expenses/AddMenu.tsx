'use client'

import type { SheetKind } from './sheet/AddSheets'

const OPTIONS: { kind: SheetKind; label: string; emoji: string; color: string }[] = [
  { kind: 'expense', label: 'Expense', emoji: '💸', color: '#f43f5e' },
  { kind: 'income', label: 'Income', emoji: '💰', color: '#10b981' },
  { kind: 'fixed', label: 'Fixed monthly', emoji: '🔁', color: '#8b5cf6' },
  { kind: 'installment', label: 'Installment plan', emoji: '💳', color: '#06b6d4' },
]

export function AddMenu({
  onPick,
  onClose,
}: {
  onPick: (kind: SheetKind) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-md p-4 pb-28"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2 rounded-3xl border border-white/10 bg-zinc-900 p-3">
          {OPTIONS.map((option) => (
            <button
              key={option.kind}
              onClick={() => onPick(option.kind)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left active:bg-white/5"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: `${option.color}22` }}
              >
                {option.emoji}
              </span>
              <span className="text-base font-medium text-zinc-100">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
