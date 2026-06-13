'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GroupSummary, GroupDetail, NewGroupExpense } from './types'

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

export const useGroups = () =>
  useQuery({ queryKey: ['groups'], queryFn: () => getJson<GroupSummary[]>('/api/groups') })

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; emoji?: string }) =>
      send<{ id: string }>('/api/groups', 'POST', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => send<{ id: string }>('/api/groups/join', 'POST', { code }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export const useGroup = (id: string, month: string) =>
  useQuery({
    queryKey: ['group', id, month],
    queryFn: () => getJson<GroupDetail>(`/api/groups/${id}?month=${month}`),
  })

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => send<{ ok: true }>(`/api/groups/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useAddGroupExpense(id: string, month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewGroupExpense) => send(`/api/groups/${id}/expenses`, 'POST', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', id, month] }),
  })
}

export function useUpdateGroupExpense(id: string, month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { expenseId: string; paid?: boolean; amount?: number; payerId?: string }) =>
      send(`/api/groups/${id}/expenses/${input.expenseId}`, 'PATCH', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', id, month] }),
  })
}

export function useDeleteGroupExpense(id: string, month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (expenseId: string) =>
      send(`/api/groups/${id}/expenses/${expenseId}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', id, month] }),
  })
}

export function useCopyMonth(id: string, month: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (from: string) => send<{ copied: number }>(`/api/groups/${id}/copy`, 'POST', { from, to: month }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group', id, month] }),
  })
}
