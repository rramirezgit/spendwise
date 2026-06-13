export interface Category {
  id: string
  label: string
  emoji: string
  color: string
}

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Food', emoji: '🍔', color: '#f59e0b' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒', color: '#22c55e' },
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#3b82f6' },
  { id: 'home', label: 'Home', emoji: '🏠', color: '#8b5cf6' },
  { id: 'health', label: 'Health', emoji: '💊', color: '#ec4899' },
  { id: 'fun', label: 'Fun', emoji: '🎉', color: '#f43f5e' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#06b6d4' },
  { id: 'bills', label: 'Bills', emoji: '🧾', color: '#64748b' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#a3a3a3' },
]

const CATEGORY_MAP = new Map(CATEGORIES.map((category) => [category.id, category]))

export function getCategory(id: string): Category {
  return CATEGORY_MAP.get(id) ?? CATEGORIES[CATEGORIES.length - 1]
}
