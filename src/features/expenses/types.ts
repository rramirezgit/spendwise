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

export interface Income {
  id: string
  amount: number
  source: string | null
  recurring: boolean
  receivedAt: string
}

export interface NewIncome {
  amount: number
  source?: string
  recurring?: boolean
}

export interface RecurringExpense {
  id: string
  amount: number
  category: string
  note: string | null
}

export interface NewRecurring {
  amount: number
  category: string
  note?: string
}

export interface Installment {
  id: string
  description: string
  totalAmount: number
  count: number
  startMonth: string
  category: string
}

export interface NewInstallment {
  description: string
  totalAmount: number
  count: number
  category: string
}
