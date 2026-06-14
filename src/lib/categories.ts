export interface DefaultCategory {
  name: string
  emoji: string
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'food', emoji: '🍔' },
  { name: 'groceries', emoji: '🛒' },
  { name: 'transport', emoji: '🚗' },
  { name: 'home', emoji: '🏠' },
  { name: 'health', emoji: '💊' },
  { name: 'fun', emoji: '🎉' },
  { name: 'shopping', emoji: '🛍️' },
  { name: 'bills', emoji: '🧾' },
  { name: 'other', emoji: '✨' },
]

export const DEFAULT_SLUGS = new Set(DEFAULT_CATEGORIES.map((category) => category.name))

export interface Category {
  id: string
  name: string
  emoji: string
}
