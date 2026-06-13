export function monthsBetween(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}

export function installmentPerMonth(totalAmount: number, count: number): number {
  return Math.round(totalAmount / count)
}

export interface InstallmentPlan {
  startMonth: string
  totalAmount: number
  count: number
}

export function installmentPaidCount(plan: InstallmentPlan, now = new Date()): number {
  const elapsed = monthsBetween(new Date(plan.startMonth), now) + 1
  return Math.min(Math.max(elapsed, 0), plan.count)
}

export function installmentChargedThisMonth(plan: InstallmentPlan, now = new Date()): number {
  const elapsed = monthsBetween(new Date(plan.startMonth), now)
  const within = elapsed >= 0 && elapsed < plan.count
  return within ? installmentPerMonth(plan.totalAmount, plan.count) : 0
}

export function isCurrentMonth(iso: string, now = new Date()): boolean {
  const date = new Date(iso)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

export type PeriodKind = 'day' | 'week' | 'month'

export interface DateRange {
  start: Date
  end: Date
}

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function periodRange(kind: PeriodKind, anchor: Date): DateRange {
  const start = startOfDay(anchor)

  if (kind === 'day') {
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    return { start, end }
  }

  if (kind === 'week') {
    const offset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - offset)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    return { start, end }
  }

  start.setDate(1)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  return { start, end }
}

export function shiftPeriod(kind: PeriodKind, anchor: Date, direction: number): Date {
  const next = new Date(anchor)
  if (kind === 'day') next.setDate(next.getDate() + direction)
  else if (kind === 'week') next.setDate(next.getDate() + direction * 7)
  else next.setMonth(next.getMonth() + direction)
  return next
}

export function withinRange(iso: string, range: DateRange): boolean {
  const time = new Date(iso).getTime()
  return time >= range.start.getTime() && time < range.end.getTime()
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
