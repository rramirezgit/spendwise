'use client'

import { useState, type ReactNode } from 'react'
import { useI18n, useMoney } from '@/lib/i18n'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del']

export function useAmount(initial = '') {
  const [raw, setRaw] = useState(initial)
  const cents = Math.round(parseFloat(raw || '0') * 100)

  const press = (key: string) => {
    if (navigator.vibrate) navigator.vibrate(8)
    if (key === 'del') return setRaw((v) => v.slice(0, -1))
    if (key === '.' && raw.includes('.')) return
    if (raw.includes('.') && raw.split('.')[1]?.length >= 2) return
    setRaw((v) => (v === '0' && key !== '.' ? key : v + key))
  }

  return { raw, cents, press }
}

export function Keypad({ onPress }: { onPress: (key: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-px bg-white/5">
      {KEYS.map((key) => (
        <button
          key={key}
          onClick={() => onPress(key)}
          className="bg-zinc-950 py-5 text-2xl font-medium text-zinc-100 active:bg-white/10"
        >
          {key === 'del' ? '⌫' : key}
        </button>
      ))}
    </div>
  )
}

interface SheetShellProps {
  title: string
  onClose: () => void
  cents: number
  amountLabel?: string
  fields?: ReactNode
  chips?: ReactNode
  onPress: (key: string) => void
  onSave: () => void
  canSave: boolean
  saveLabel: string
  accent?: string
}

export function SheetShell({
  title,
  onClose,
  cents,
  amountLabel,
  fields,
  chips,
  onPress,
  onSave,
  canSave,
  saveLabel,
  accent = '#10b981',
}: SheetShellProps) {
  const { t } = useI18n()
  const money = useMoney()

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-5 pt-5">
        <button onClick={onClose} className="rounded-full px-3 py-2 text-sm text-zinc-400 active:bg-white/10">
          {t('cancel')}
        </button>
        <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{title}</span>
        <span className="w-14" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center px-6 py-5">
          <span className="text-sm text-zinc-500">{amountLabel ?? t('amount')}</span>
          <span className="mt-2 text-6xl font-semibold tabular-nums" style={{ color: accent }}>
            {money(cents)}
          </span>
          {fields}
        </div>
      </div>

      {chips && <div className="border-t border-white/[0.06] pt-3">{chips}</div>}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <Keypad onPress={onPress} />
      </div>

      <button
        onClick={onSave}
        disabled={!canSave}
        className="m-4 rounded-2xl py-4 text-lg font-semibold text-zinc-950 transition-opacity active:opacity-80 disabled:opacity-30"
        style={{ backgroundColor: accent }}
      >
        {saveLabel}
      </button>
    </div>
  )
}
