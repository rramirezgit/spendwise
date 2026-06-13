export interface Expense {
  id: string
  amount: number
  note: string | null
  category: string
  spentAt: string
}

export interface NewExpense {
  amount: number
  category: string
  note?: string
}
