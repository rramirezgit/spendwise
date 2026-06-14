export interface DefaultCategory {
  name: string
  emoji: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'food', emoji: '🍔' },
  { name: 'outings', emoji: '🍻' },
  { name: 'groceries', emoji: '🛒' },
  { name: 'transport', emoji: '🚗' },
  { name: 'errands', emoji: '📄' },
  { name: 'health', emoji: '💊' },
  { name: 'home', emoji: '🏠' },
  { name: 'bills', emoji: '🧾' },
  { name: 'shopping', emoji: '🛍️' },
  { name: 'other', emoji: '✨' },
]

export const DEFAULT_SLUGS = new Set(DEFAULT_CATEGORIES.map((category) => category.name))

export interface Category {
  id: string
  name: string
  emoji: string
}
