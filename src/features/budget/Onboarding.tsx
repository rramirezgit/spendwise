'use client'

import { useState } from 'react'
import { useCreateBudget, useJoinBudget } from './queries'

export function Onboarding() {
  const create = useCreateBudget()
  const join = useJoinBudget()
  const [name, setName] = useState('Casa')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'create' | 'join'>('create')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-7 pb-10">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl shadow-lg shadow-emerald-500/30">
        💑
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-50">Your shared budget</h1>
      <p className="mt-2 text-sm text-zinc-500">
        One monthly budget for two. Create it and invite your partner, or join with their code.
      </p>

      <div className="mt-8 flex gap-1 rounded-full bg-white/[0.04] p-1">
        <button
          onClick={() => setMode('create')}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            mode === 'create' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Create
        </button>
        <button
          onClick={() => setMode('join')}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${
            mode === 'join' ? 'bg-white/10 text-zinc-100' : 'text-zinc-500'
          }`}
        >
          Join
        </button>
      </div>

      {mode === 'create' ? (
        <div className="mt-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Budget name (e.g. Casa)"
            aria-label="Budget name"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          <button
            disabled={!name.trim() || create.isPending}
            onClick={() => create.mutate(name.trim())}
            className="w-full rounded-2xl bg-emerald-500 py-3.5 text-base font-semibold text-zinc-950 disabled:opacity-40"
          >
            Create budget
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste invite code"
            aria-label="Invite code"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50"
          />
          {join.isError && <p className="text-xs text-rose-400">Budget not found. Check the code.</p>}
          <button
            disabled={!code.trim() || join.isPending}
            onClick={() => join.mutate(code.trim())}
            className="w-full rounded-2xl bg-zinc-100 py-3.5 text-base font-semibold text-zinc-900 disabled:opacity-40"
          >
            Join budget
          </button>
        </div>
      )}
    </div>
  )
}
