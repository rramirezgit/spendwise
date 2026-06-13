'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Expense,
  NewExpense,
  Income,
  NewIncome,
  RecurringExpense,
  NewRecurring,
  Installment,
  NewInstallment,
} from './types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json()
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Failed to create ${url}`)
  return res.json()
}

function useList<T>(key: string, url: string) {
  return useQuery({ queryKey: [key], queryFn: () => getJson<T[]>(url) })
}

function useCreate<TInput, TItem extends { id: string }>(
  key: string,
  url: string,
  optimistic: (input: TInput) => TItem,
  prepend = true
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TInput) => postJson<TItem>(url, input),
    onMutate: async (input: TInput) => {
      await queryClient.cancelQueries({ queryKey: [key] })
      const previous = queryClient.getQueryData<TItem[]>([key]) ?? []
      const item = optimistic(input)
      queryClient.setQueryData<TItem[]>([key], prepend ? [item, ...previous] : [...previous, item])
      return { previous }
    },
    onError: (_e, _v, context) => {
      if (context?.previous) queryClient.setQueryData([key], context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: [key] }),
  })
}

function useDelete(key: string, baseUrl: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${baseUrl}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [key] })
      const previous = queryClient.getQueryData<{ id: string }[]>([key]) ?? []
      queryClient.setQueryData(
        [key],
        previous.filter((item) => item.id !== id)
      )
      return { previous }
    },
    onError: (_e, _id, context) => {
      if (context?.previous) queryClient.setQueryData([key], context.previous)
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: [key] }),
  })
}

const tempId = () => `temp-${Date.now()}`

export const useExpenses = () => useList<Expense>('expenses', '/api/expenses')
export const useAddExpense = () =>
  useCreate<NewExpense, Expense>('expenses', '/api/expenses', (input) => ({
    id: tempId(),
    amount: input.amount,
    category: input.category,
    note: input.note ?? null,
    spentAt: new Date().toISOString(),
  }))
export const useDeleteExpense = () => useDelete('expenses', '/api/expenses')

export const useIncomes = () => useList<Income>('income', '/api/income')
export const useAddIncome = () =>
  useCreate<NewIncome, Income>('income', '/api/income', (input) => ({
    id: tempId(),
    amount: input.amount,
    source: input.source ?? null,
    recurring: input.recurring ?? false,
    receivedAt: new Date().toISOString(),
  }))
export const useDeleteIncome = () => useDelete('income', '/api/income')

export const useRecurring = () => useList<RecurringExpense>('recurring', '/api/recurring')
export const useAddRecurring = () =>
  useCreate<NewRecurring, RecurringExpense>('recurring', '/api/recurring', (input) => ({
    id: tempId(),
    amount: input.amount,
    category: input.category,
    note: input.note ?? null,
  }))
export const useDeleteRecurring = () => useDelete('recurring', '/api/recurring')

export const useInstallments = () => useList<Installment>('installments', '/api/installments')
export const useAddInstallment = () =>
  useCreate<NewInstallment, Installment>('installments', '/api/installments', (input) => ({
    id: tempId(),
    description: input.description,
    totalAmount: input.totalAmount,
    count: input.count,
    startMonth: new Date().toISOString(),
    category: input.category,
  }))
export const useDeleteInstallment = () => useDelete('installments', '/api/installments')
