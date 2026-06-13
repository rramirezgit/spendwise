'use client'

import { useState } from 'react'
import { useExpenses, useIncomes, useRecurring, useInstallments } from './queries'
import { Balance } from './Balance'
import { Summary } from './Summary'
import { ExpenseList } from './ExpenseList'
import { FixedList } from './sections/FixedList'
import { InstallmentList } from './sections/InstallmentList'
import { IncomeList } from './sections/IncomeList'
import { AddMenu } from './AddMenu'
import { AddSheet, type SheetKind } from './sheet/AddSheets'

type Tab = 'home' | 'fixed' | 'installments' | 'income'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'fixed', label: 'Fixed', emoji: '🔁' },
  { id: 'installments', label: 'Plans', emoji: '💳' },
  { id: 'income', label: 'Income', emoji: '💰' },
]

export function ExpenseApp() {
  const [tab, setTab] = useState<Tab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sheet, setSheet] = useState<SheetKind | null>(null)

  const expenses = useExpenses()
  const incomes = useIncomes()
  const recurring = useRecurring()
  const installments = useInstallments()

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <header className="px-5 pt-7">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Spendwise</h1>
        <p className="text-sm text-zinc-500">Tap, pick, done.</p>
      </header>

      {tab === 'home' && (
        <>
          <Balance
            expenses={expenses.data ?? []}
            incomes={incomes.data ?? []}
            recurring={recurring.data ?? []}
            installments={installments.data ?? []}
          />
          <Summary expenses={expenses.data ?? []} />
          <ExpenseList expenses={expenses.data ?? []} />
        </>
      )}
      {tab === 'fixed' && <FixedList />}
      {tab === 'installments' && <InstallmentList />}
      {tab === 'income' && <IncomeList />}

      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 items-center justify-around border-t border-white/[0.07] bg-zinc-950/90 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        {TABS.slice(0, 2).map((item) => (
          <TabButton key={item.id} item={item} active={tab === item.id} onClick={() => setTab(item.id)} />
        ))}

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Add"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl text-zinc-950 shadow-lg shadow-emerald-500/30 active:scale-90"
        >
          +
        </button>

        {TABS.slice(2).map((item) => (
          <TabButton key={item.id} item={item} active={tab === item.id} onClick={() => setTab(item.id)} />
        ))}
      </nav>

      {menuOpen && (
        <AddMenu
          onClose={() => setMenuOpen(false)}
          onPick={(kind) => {
            setMenuOpen(false)
            setSheet(kind)
          }}
        />
      )}

      {sheet && <AddSheet kind={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}

function TabButton({
  item,
  active,
  onClick,
}: {
  item: { label: string; emoji: string }
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-16 flex-col items-center gap-0.5 py-1 text-[10px] ${active ? 'text-zinc-100' : 'text-zinc-600'}`}
    >
      <span className="text-lg">{item.emoji}</span>
      {item.label}
    </button>
  )
}
