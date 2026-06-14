'use client'

import { useEffect, useState } from 'react'
import { useI18n, type TKey } from '@/lib/i18n'
import { DEFAULT_SLUGS } from '@/lib/categories'
import { useCategories, useAddCategory } from './queries'

export function catLabel(name: string, t: (key: TKey) => string): string {
  return DEFAULT_SLUGS.has(name) ? t(`cat_${name}` as TKey) : name
}

export function CategoryPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { t } = useI18n()
  const { data: categories = [] } = useCategories()
  const addCategory = useAddCategory()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏷️')

  useEffect(() => {
    if (!value && categories.length > 0) onChange(categories[0].id)
  }, [value, categories, onChange])

  return (
    <div>
      {adding && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
            aria-label="Emoji"
            className="w-12 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-center text-base"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('name')}
            aria-label={t('name')}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          <button
            disabled={!name.trim() || !emoji.trim() || addCategory.isPending}
            onClick={() =>
              addCategory.mutate(
                { name: name.trim(), emoji: emoji.trim() },
                {
                  onSuccess: (created) => {
                    onChange(created.id)
                    setName('')
                    setEmoji('🏷️')
                    setAdding(false)
                  },
                }
              )
            }
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
          >
            ✓
          </button>
          <button onClick={() => setAdding(false)} className="px-2 text-sm text-zinc-500">
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => {
          const active = category.id === value
          return (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                active
                  ? 'border-emerald-500 bg-emerald-500 font-medium text-zinc-950'
                  : 'border-white/10 bg-white/[0.04] text-zinc-300'
              }`}
            >
              <span>{category.emoji}</span>
              {catLabel(category.name, t)}
            </button>
          )
        })}
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-white/15 px-3.5 py-2 text-sm text-zinc-400"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
