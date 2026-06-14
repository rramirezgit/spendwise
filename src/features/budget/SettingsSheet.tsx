'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useCategories, useAddCategory, useDeleteCategory, useUpdateBudget } from './queries'
import { catLabel } from './CategoryPicker'

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-2 text-xs font-medium tracking-widest text-zinc-500 uppercase">{children}</p>
}

export function SettingsSheet({ currency, onClose }: { currency: string; onClose: () => void }) {
  const { t, locale, setLocale } = useI18n()
  const { data: categories = [] } = useCategories()
  const addCategory = useAddCategory()
  const deleteCategory = useDeleteCategory()
  const updateBudget = useUpdateBudget()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏷️')

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="text-xs font-medium tracking-widest text-zinc-500 uppercase">{t('settings')}</span>
        <button onClick={onClose} className="rounded-full px-3 py-2 text-sm text-zinc-400 active:bg-white/10">
          {t('done')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <SectionTitle>{t('currency')}</SectionTitle>
        <div className="flex gap-2">
          {(['ARS', 'USD'] as const).map((option) => (
            <button
              key={option}
              onClick={() => updateBudget.mutate({ currency: option })}
              className={`flex-1 rounded-2xl border py-3 text-sm font-medium ${
                currency === option
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 text-zinc-400'
              }`}
            >
              {option === 'ARS' ? t('currency_ars') : t('currency_usd')}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <SectionTitle>{t('language')}</SectionTitle>
          <div className="flex gap-2">
            {(['es', 'en'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setLocale(option)}
                className={`flex-1 rounded-2xl border py-3 text-sm font-medium ${
                  locale === option
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                    : 'border-white/10 text-zinc-400'
                }`}
              >
                {option === 'es' ? 'Español' : 'English'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <SectionTitle>{t('categories')}</SectionTitle>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="flex-1 text-sm text-zinc-200">{catLabel(category.name, t)}</span>
                <button
                  onClick={() => deleteCategory.mutate(category.id)}
                  aria-label={t('delete')}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 active:bg-white/5 active:text-rose-400"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              aria-label="Emoji"
              className="w-12 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-center text-base"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('category_name_ph')}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
            <button
              disabled={!name.trim() || !emoji.trim() || addCategory.isPending}
              onClick={() =>
                addCategory.mutate(
                  { name: name.trim(), emoji: emoji.trim() },
                  {
                    onSuccess: () => {
                      setName('')
                      setEmoji('🏷️')
                    },
                  }
                )
              }
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
            >
              ＋
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
