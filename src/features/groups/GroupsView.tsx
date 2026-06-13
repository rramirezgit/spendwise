'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatAmount } from '@/lib/format'
import { useGroups, useCreateGroup, useJoinGroup } from './queries'

export function GroupsView() {
  const { data: groups = [], isPending } = useGroups()
  const create = useCreateGroup()
  const join = useJoinGroup()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🏠')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none')

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pt-7 pb-28">
      <header className="flex items-center gap-3">
        <Link href="/" aria-label="Back" className="text-xl text-zinc-400 active:text-zinc-100">
          ‹
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Shared groups</h1>
          <p className="text-sm text-zinc-500">Split costs with others.</p>
        </div>
      </header>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode(mode === 'create' ? 'none' : 'create')}
          className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 active:opacity-80"
        >
          ＋ New group
        </button>
        <button
          onClick={() => setMode(mode === 'join' ? 'none' : 'join')}
          className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-medium text-zinc-200 active:bg-white/5"
        >
          Join with code
        </button>
      </div>

      {mode === 'create' && (
        <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex gap-2">
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              aria-label="Emoji"
              className="w-14 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-center text-lg"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name (e.g. Casa)"
              aria-label="Group name"
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
            />
          </div>
          <button
            disabled={!name.trim() || create.isPending}
            onClick={() =>
              create.mutate(
                { name: name.trim(), emoji },
                {
                  onSuccess: () => {
                    setName('')
                    setMode('none')
                  },
                }
              )
            }
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
          >
            Create group
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste invite code"
            aria-label="Invite code"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
          {join.isError && <p className="text-xs text-rose-400">Group not found. Check the code.</p>}
          <button
            disabled={!code.trim() || join.isPending}
            onClick={() =>
              join.mutate(code.trim(), {
                onSuccess: () => {
                  setCode('')
                  setMode('none')
                },
              })
            }
            className="w-full rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-900 disabled:opacity-40"
          >
            Join group
          </button>
        </div>
      )}

      {isPending ? (
        <p className="pt-10 text-center text-sm text-zinc-600">Loading…</p>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 text-sm text-zinc-500">
            No groups yet. Create one for your home or a trip, then invite people with the code.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 active:bg-white/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-xl">
                  {group.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{group.name}</p>
                  <p className="text-xs text-zinc-500">
                    {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'} ·{' '}
                    {formatAmount(group.total)} total
                  </p>
                </div>
                <div className="text-right">
                  {group.net === 0 ? (
                    <span className="text-xs text-zinc-500">settled</span>
                  ) : group.net > 0 ? (
                    <span className="text-sm font-medium tabular-nums text-emerald-400">
                      +{formatAmount(group.net)}
                    </span>
                  ) : (
                    <span className="text-sm font-medium tabular-nums text-rose-400">
                      −{formatAmount(-group.net)}
                    </span>
                  )}
                  <p className="text-[10px] text-zinc-600">your balance</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
