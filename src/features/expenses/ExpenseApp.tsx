'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { Session } from 'next-auth'
import { useSession, signOut } from 'next-auth/react'
import { SignIn } from '@/features/auth/SignIn'
import { periodRange, withinRange } from '@/lib/finance'
import { useExpenses, useIncomes, useRecurring, useInstallments } from './queries'
import { Balance } from './Balance'
import { Summary } from './Summary'
import { ExpenseList } from './ExpenseList'
import { PeriodBar, type Period } from './PeriodBar'
import { FixedList } from './sections/FixedList'
import { InstallmentList } from './sections/InstallmentList'
import { IncomeList } from './sections/IncomeList'
import { SavingsList } from './sections/SavingsList'
import { AddMenu } from './AddMenu'
import { AddSheet, type SheetKind } from './sheet/AddSheets'

type Tab = 'home' | 'fixed' | 'installments' | 'income' | 'savings'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'fixed', label: 'Fixed', emoji: '🔁' },
  { id: 'installments', label: 'Plans', emoji: '💳' },
  { id: 'income', label: 'Income', emoji: '💰' },
  { id: 'savings', label: 'Savings', emoji: '🐷' },
]

export function ExpenseApp() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center text-2xl">💸</div>
  }

  if (status === 'unauthenticated' || !session) {
    return <SignIn />
  }

  return <Dashboard session={session} />
}

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<Tab>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sheet, setSheet] = useState<SheetKind | null>(null)
  const [period, setPeriod] = useState<Period>(() => ({ kind: 'month', anchor: new Date() }))

  const expenses = useExpenses()
  const incomes = useIncomes()
  const recurring = useRecurring()
  const installments = useInstallments()

  const periodExpenses = useMemo(() => {
    const range = periodRange(period.kind, period.anchor)
    return (expenses.data ?? []).filter((expense) => withinRange(expense.spentAt, range))
  }, [expenses.data, period])

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <header className="flex items-start justify-between px-5 pt-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Spendwise</h1>
          <p className="text-sm text-zinc-500">Tap, pick, done.</p>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Link
            href="/groups"
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 active:bg-white/5"
          >
            👥 Groups
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title="Sign out"
            aria-label="Sign out"
            className="flex items-center rounded-full border border-white/10 p-1 text-xs text-zinc-400 active:bg-white/5"
          >
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-[10px] uppercase">
                {session?.user?.name?.[0] ?? '?'}
              </span>
            )}
          </button>
        </div>
      </header>

      {tab === 'home' && (
        <>
          <PeriodBar period={period} onChange={setPeriod} />
          {period.kind === 'month' && (
            <Balance
              month={period.anchor}
              expenses={expenses.data ?? []}
              incomes={incomes.data ?? []}
              recurring={recurring.data ?? []}
              installments={installments.data ?? []}
            />
          )}
          <Summary expenses={periodExpenses} />
          <ExpenseList expenses={periodExpenses} />
        </>
      )}
      {tab === 'fixed' && <FixedList />}
      {tab === 'installments' && <InstallmentList />}
      {tab === 'income' && <IncomeList />}
      {tab === 'savings' && <SavingsList />}

      <button
        onClick={() => setMenuOpen(true)}
        aria-label="Add"
        className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl text-zinc-950 shadow-lg shadow-emerald-500/30 active:scale-90"
      >
        +
      </button>

      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center border-t border-white/[0.07] bg-zinc-950/90 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        {TABS.map((item) => (
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
      className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] ${active ? 'text-zinc-100' : 'text-zinc-600'}`}
    >
      <span className="text-lg">{item.emoji}</span>
      {item.label}
    </button>
  )
}
