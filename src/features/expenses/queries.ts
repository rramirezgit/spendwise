'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Expense, NewExpense } from './types'

const KEY = ['expenses'] as const

async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch('/api/expenses')
  if (!res.ok) throw new Error('Failed to load expenses')
  return res.json()
}

export function useExpenses() {
  return useQuery({ queryKey: KEY, queryFn: fetchExpenses })
}

export function useAddExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expense: NewExpense): Promise<Expense> => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      return res.json()
    },
    onMutate: async (expense) => {
      await queryClient.cancelQueries({ queryKey: KEY })
      const previous = queryClient.getQueryData<Expense[]>(KEY) ?? []
      const optimistic: Expense = {
        id: `temp-${Date.now()}`,
        amount: expense.amount,
        category: expense.category,
        note: expense.note ?? null,
        spentAt: new Date().toISOString(),
      }
      queryClient.setQueryData<Expense[]>(KEY, [optimistic, ...previous])
      return { previous }
    },
    onError: (_error, _expense, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete expense')
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEY })
      const previous = queryClient.getQueryData<Expense[]>(KEY) ?? []
      queryClient.setQueryData<Expense[]>(
        KEY,
        previous.filter((expense) => expense.id !== id)
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(KEY, context.previous)
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: KEY })
    },
  })
}
