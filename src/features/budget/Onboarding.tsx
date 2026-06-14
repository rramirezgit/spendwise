'use client'

import { useState } from 'react'
import { useI18n, LanguageToggle } from '@/lib/i18n'
import { useCreateBudget, useJoinBudget } from './queries'

export function Onboarding() {
  const { t } = useI18n()
  const create = useCreateBudget()
  const join = useJoinBudget()
  const [name, setName] = useState('Casa')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'create' | 'join'>('create')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-7 pb-10">
      <div className="absolute top-5 right-5">
        <LanguageToggle />
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-lg shadow-emerald-500/30">
        💑
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-50">{t('onb_title')}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t('onb_subtitle')}</p>

      <div className="mt-8 flex gap-1 rounded-full bg-white/[0.04] p-1">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            mode === 'create' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
          }`}
        >
          {t('onb_create')}
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            mode === 'join' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
          }`}
        >
          {t('onb_join')}
        </button>
      </div>

      {mode === 'create' ? (
        <div className="mt-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('onb_name_ph')}
            aria-label={t('onb_name_ph')}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            disabled={!name.trim() || create.isPending}
            onClick={() => create.mutate(name.trim())}
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-base font-semibold text-zinc-950 disabled:opacity-40"
          >
            {t('onb_create_btn')}
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('onb_code_ph')}
            aria-label={t('onb_code_ph')}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          {join.isError && <p className="text-xs text-rose-400">{t('onb_not_found')}</p>}
          <button
            disabled={!code.trim() || join.isPending}
            onClick={() => join.mutate(code.trim())}
            className="w-full rounded-2xl bg-zinc-100 py-3.5 text-base font-semibold text-zinc-900 disabled:opacity-40"
          >
            {t('onb_join_btn')}
          </button>
        </div>
      )}
    </div>
  )
}
