'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useI18n, CurrencyProvider, LanguageToggle, type TKey } from '@/lib/i18n'
import { shiftPeriod, monthKey } from '@/lib/finance'
import { formatMonthLabel } from '@/lib/format'
import { SignIn } from '@/features/auth/SignIn'
import { useBudget, useMonth } from './queries'
import { Onboarding } from './Onboarding'
import { FixedTab } from './FixedTab'
import { ControlTab } from './ControlTab'
import { SavingsTab } from './SavingsTab'
import { HistoryTab } from './HistoryTab'
import { SettingsSheet } from './SettingsSheet'

type Tab = 'fixed' | 'control' | 'savings' | 'history'

const TAB_IDS: { id: Tab; emoji: string }[] = [
  { id: 'fixed', emoji: '🔁' },
  { id: 'control', emoji: '📊' },
  { id: 'savings', emoji: '🐷' },
  { id: 'history', emoji: '📅' },
]

export function BudgetApp() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="flex min-h-dvh items-center justify-center text-2xl">💑</div>
  }
  if (status === 'unauthenticated') {
    return <SignIn />
  }
  return <Authed />
}

function Authed() {
  const budget = useBudget()

  if (budget.isPending) {
    return <div className="flex min-h-dvh items-center justify-center text-2xl">💑</div>
  }
  if (!budget.data) {
    return <Onboarding />
  }
  return <Dashboard />
}

function Dashboard() {
  const { t, locale } = useI18n()
  const { data: session } = useSession()
  const budget = useBudget()
  const [tab, setTab] = useState<Tab>('fixed')
  const [anchor, setAnchor] = useState(() => new Date())
  const [showInvite, setShowInvite] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const month = monthKey(anchor)
  const monthData = useMonth(month)

  const currentUserId = session?.user?.id ?? ''
  const data = budget.data!
  const members = data.members
  const showMonthBar = tab === 'fixed' || tab === 'control'

  return (
    <CurrencyProvider value={data.currency}>
      <div className="mx-auto min-h-dvh w-full max-w-md">
        <header className="flex items-start justify-between px-5 pt-7">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-50">{data.name}</h1>
            <p className="truncate text-sm text-zinc-500">{members.map((m) => m.name).join(' · ')}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <button
              onClick={() => setShowInvite((v) => !v)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 active:bg-white/5"
            >
              {t('invite')}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              aria-label={t('settings')}
              className="rounded-full border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 active:bg-white/5"
            >
              ⚙
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              aria-label="Sign out"
              className="rounded-full border border-white/10 p-1.5 text-zinc-400 active:bg-white/5"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="h-5 w-5 rounded-full" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center text-[10px]">⎋</span>
              )}
            </button>
          </div>
        </header>

        {showInvite && (
          <div className="mx-5 mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-zinc-500">{t('invite_help')}</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white/[0.06] px-3 py-2 text-sm tracking-widest text-emerald-300">
                {data.inviteCode}
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText(data.inviteCode)}
                className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-900 active:opacity-80"
              >
                {t('copy')}
              </button>
            </div>
          </div>
        )}

        {showMonthBar && (
          <div className="mt-4 flex items-center justify-between px-5">
            <button
              onClick={() => setAnchor((a) => shiftPeriod('month', a, -1))}
              aria-label="Previous month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-zinc-300">{formatMonthLabel(anchor, locale)}</span>
            <button
              onClick={() => setAnchor((a) => shiftPeriod('month', a, 1))}
              aria-label="Next month"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-white/10"
            >
              ›
            </button>
          </div>
        )}

        {showMonthBar && monthData.isPending ? (
          <p className="px-5 pt-10 text-center text-sm text-zinc-600">{t('loading')}</p>
        ) : (
          <>
            {tab === 'fixed' && monthData.data && (
              <FixedTab month={month} data={monthData.data} members={members} currentUserId={currentUserId} />
            )}
            {tab === 'control' && <ControlTab month={month} />}
            {tab === 'savings' && <SavingsTab />}
            {tab === 'history' && (
              <HistoryTab
                onPick={(picked) => {
                  const [year, m] = picked.split('-').map(Number)
                  setAnchor(new Date(year, m - 1, 1))
                  setTab('fixed')
                }}
              />
            )}
          </>
        )}

        <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-md -translate-x-1/2 items-center border-t border-white/[0.07] bg-zinc-950/90 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
          {TAB_IDS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] ${
                tab === item.id ? 'text-zinc-100' : 'text-zinc-600'
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              {t(`tab_${item.id}` as TKey)}
            </button>
          ))}
        </nav>

        {showSettings && <SettingsSheet currency={data.currency} onClose={() => setShowSettings(false)} />}
      </div>
    </CurrencyProvider>
  )
}
