import type { Locale } from './i18n'

function tag(locale: Locale): string {
  return locale === 'es' ? 'es-AR' : 'en-US'
}

export function formatMoney(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(tag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatDayLabel(iso: string, locale: Locale = 'en'): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (sameDay(date, today)) return locale === 'es' ? 'Hoy' : 'Today'
  if (sameDay(date, yesterday)) return locale === 'es' ? 'Ayer' : 'Yesterday'
  return date.toLocaleDateString(tag(locale), { weekday: 'long', day: 'numeric', month: 'short' })
}

export function formatMonthLabel(date: Date, locale: Locale = 'en'): string {
  return date.toLocaleDateString(tag(locale), { month: 'long', year: 'numeric' })
}
