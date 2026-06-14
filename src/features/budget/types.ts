export interface BudgetMember {
  userId: string
  name: string
  image: string | null
}

export interface Budget {
  id: string
  name: string
  currency: string
  inviteCode: string
  ownerId: string
  members: BudgetMember[]
}

export interface Category {
  id: string
  name: string
  emoji: string
}

export interface FixedTemplate {
  id: string
  name: string
  amount: number
  category: string
  payerId: string | null
  splitPaid: boolean
}

export interface BudgetExpenseInfo {
  id: string
  name: string
  amount: number
  category: string
  note: string | null
  payerId: string | null
  splitPaid: boolean
  paid: boolean
  paidAt: string | null
  isFixed: boolean
}

export interface BudgetBalance {
  userId: string
  name: string
  paid: number
  owed: number
  net: number
}

export interface BudgetTransfer {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
}

export interface MonthData {
  month: string
  fixed: BudgetExpenseInfo[]
  extras: BudgetExpenseInfo[]
  balances: BudgetBalance[]
  transfers: BudgetTransfer[]
  total: number
  paidTotal: number
  templateCount: number
  fixedGenerated: number
}

export interface SavingInfo {
  id: string
  amount: number
  kind: 'deposit' | 'withdraw'
  note: string | null
  savedAt: string
  byName: string | null
}

export interface HistoryMonth {
  month: string
  total: number
  paidTotal: number
  count: number
  balances: BudgetBalance[]
  transfers: BudgetTransfer[]
}

export interface NewExpense {
  month: string
  name: string
  amount: number
  category: string
  note?: string
  payerId?: string | null
  splitPaid?: boolean
}
