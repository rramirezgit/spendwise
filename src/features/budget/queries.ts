'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  Budget,
  FixedTemplate,
  MonthData,
  SavingInfo,
  HistoryMonth,
  NewExpense,
  DailyExpenseInfo,
} from './types'

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load ${url}`)
  return res.json()
}

async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Request failed: ${url}`)
  return res.json()
}

export const useBudget = () =>
  useQuery({ queryKey: ['budget'], queryFn: () => getJson<Budget | null>('/api/budget') })

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => send<{ id: string }>('/api/budget', 'POST', { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useJoinBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => send<{ id: string }>('/api/budget/join', 'POST', { code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export const useMonth = (month: string) =>
  useQuery({
    queryKey: ['budget-month', month],
    queryFn: () => getJson<MonthData>(`/api/budget/month?month=${month}`),
  })

export const useFixedTemplates = () =>
  useQuery({ queryKey: ['budget-fixed'], queryFn: () => getJson<FixedTemplate[]>('/api/budget/fixed') })

function useMonthMutation<TInput>(month: string, fn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-month', month] })
      queryClient.invalidateQueries({ queryKey: ['budget-fixed'] })
      queryClient.invalidateQueries({ queryKey: ['budget-history'] })
    },
  })
}

export const useAddFixed = (month: string) =>
  useMonthMutation(month, (input: NewExpense) => send('/api/budget/fixed', 'POST', { ...input, month }))

export const useGenerate = (month: string) =>
  useMonthMutation(month, () => send('/api/budget/generate', 'POST', { month }))

export const useAddExtra = (month: string) =>
  useMonthMutation(month, (input: NewExpense) => send('/api/budget/expenses', 'POST', input))

export const useUpdateExpense = (month: string) =>
  useMonthMutation(
    month,
    (input: {
      id: string
      paid?: boolean
      amount?: number
      payerId?: string | null
      splitPaid?: boolean
      name?: string
    }) => send(`/api/budget/expenses/${input.id}`, 'PATCH', input)
  )

export const useDeleteExpense = (month: string) =>
  useMonthMutation(month, (id: string) => send(`/api/budget/expenses/${id}`, 'DELETE'))

export const useSavings = () =>
  useQuery({ queryKey: ['budget-savings'], queryFn: () => getJson<SavingInfo[]>('/api/budget/savings') })

export function useAddSaving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { amount: number; kind: 'deposit' | 'withdraw'; note?: string }) =>
      send('/api/budget/savings', 'POST', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-savings'] }),
  })
}

export function useDeleteSaving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => send(`/api/budget/savings/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-savings'] }),
  })
}

export const useHistory = () =>
  useQuery({ queryKey: ['budget-history'], queryFn: () => getJson<HistoryMonth[]>('/api/budget/history') })

export const useDaily = (month: string) =>
  useQuery({
    queryKey: ['budget-daily', month],
    queryFn: () => getJson<DailyExpenseInfo[]>(`/api/budget/daily?month=${month}`),
  })

export function useAddDaily(month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { amount: number; category: string; note?: string }) =>
      send('/api/budget/daily', 'POST', { ...input, month }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-daily', month] }),
  })
}

export function useUpdateDaily(month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { id: string; amount?: number; category?: string; note?: string | null }) =>
      send(`/api/budget/daily/${input.id}`, 'PATCH', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-daily', month] }),
  })
}

export function useDeleteDaily(month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => send(`/api/budget/daily/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-daily', month] }),
  })
}

export const useCategories = () =>
  useQuery({
    queryKey: ['budget-categories'],
    queryFn: () => getJson<{ id: string; name: string; emoji: string }[]>('/api/budget/categories'),
  })

export function useAddCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; emoji: string }) =>
      send<{ id: string; name: string; emoji: string }>('/api/budget/categories', 'POST', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => send(`/api/budget/categories/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget-categories'] }),
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { currency?: string; name?: string }) => send('/api/budget', 'PATCH', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budget'] }),
  })
}
