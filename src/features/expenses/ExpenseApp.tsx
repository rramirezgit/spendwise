'use client'

import { useState } from 'react'
import { useExpenses } from './queries'
import { Summary } from './Summary'
import { ExpenseList } from './ExpenseList'
import { QuickAdd } from './QuickAdd'

export function ExpenseApp() {
  const [adding, setAdding] = useState(false)
  const { data: expenses = [], isPending } = useExpenses()

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md">
      <header className="px-5 pt-7">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Spendwise</h1>
        <p className="text-sm text-zinc-500">Tap, pick, done.</p>
      </header>

      {isPending ? (
        <div className="px-5 pt-10 text-center text-sm text-zinc-600">Loading…</div>
      ) : (
        <>
          <Summary expenses={expenses} />
          <ExpenseList expenses={expenses} />
        </>
      )}

      <button
        onClick={() => setAdding(true)}
        aria-label="Add expense"
        className="fixed bottom-6 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-emerald-500 text-3xl text-zinc-950 shadow-lg shadow-emerald-500/30 transition-transform active:scale-90"
      >
        +
      </button>

      {adding && <QuickAdd onClose={() => setAdding(false)} />}
    </main>
  )
}
