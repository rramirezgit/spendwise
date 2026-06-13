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
