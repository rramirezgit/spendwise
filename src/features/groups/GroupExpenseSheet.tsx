'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { SheetShell, CategoryChips, useAmount } from '@/features/expenses/sheet/primitives'
import { useAddGroupExpense } from './queries'
import type { GroupMemberInfo } from './types'

const fieldClass =
  'mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-center text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50'

export function GroupExpenseSheet({
  groupId,
  month,
  members,
  currentUserId,
  onClose,
}: {
  groupId: string
  month: string
  members: GroupMemberInfo[]
  currentUserId: string
  onClose: () => void
}) {
  const { cents, press } = useAmount()
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[3].id)
  const [payerId, setPayerId] = useState(currentUserId)
  const [participants, setParticipants] = useState<string[]>(members.map((member) => member.userId))
  const add = useAddGroupExpense(groupId, month)

  const toggle = (userId: string) =>
    setParticipants((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    )

  return (
    <SheetShell
      title="Shared expense"
      amountLabel="Amount"
      onClose={onClose}
      cents={cents}
      accent="#10b981"
      onPress={press}
      canSave={cents > 0 && description.trim().length > 0 && participants.length > 0}
      saveLabel="Add to group"
      onSave={() => {
        add.mutate({
          amount: cents,
          description: description.trim(),
          category,
          payerId,
          participantIds: participants,
          month,
        })
        onClose()
      }}
      fields={
        <>
          <input
            name="description"
            aria-label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is it? (e.g. Alquiler, Edenor)"
            className={fieldClass}
          />
          <div className="mt-5 w-full max-w-xs">
            <p className="mb-2 text-xs text-zinc-500">Paid by</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <button
                  key={member.userId}
                  onClick={() => setPayerId(member.userId)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    payerId === member.userId
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-white/10 text-zinc-400'
                  }`}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 w-full max-w-xs">
            <p className="mb-2 text-xs text-zinc-500">Split between</p>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const active = participants.includes(member.userId)
                return (
                  <button
                    key={member.userId}
                    onClick={() => toggle(member.userId)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      active ? 'border-zinc-300 bg-white/10 text-zinc-100' : 'border-white/10 text-zinc-600'
                    }`}
                  >
                    {active ? '✓ ' : ''}
                    {member.name}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      }
      chips={<CategoryChips value={category} onChange={setCategory} />}
    />
  )
}
