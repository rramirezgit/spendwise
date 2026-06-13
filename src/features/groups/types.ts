export interface GroupSummary {
  id: string
  name: string
  emoji: string
  inviteCode: string
  memberCount: number
  total: number
  net: number
}

export interface GroupMemberInfo {
  userId: string
  name: string
  image: string | null
}

export interface GroupShare {
  userId: string
  amount: number
}

export interface GroupExpenseInfo {
  id: string
  amount: number
  description: string
  category: string
  month: string
  paid: boolean
  spentAt: string
  payerId: string
  payerName: string
  shares: GroupShare[]
}

export interface GroupBalance {
  userId: string
  name: string
  paid: number
  owed: number
  net: number
}

export interface GroupTransfer {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number
}

export interface GroupDetail {
  id: string
  name: string
  emoji: string
  inviteCode: string
  ownerId: string
  members: GroupMemberInfo[]
  expenses: GroupExpenseInfo[]
  balances: GroupBalance[]
  transfers: GroupTransfer[]
  total: number
  paidTotal: number
}

export interface NewGroupExpense {
  amount: number
  description: string
  category: string
  payerId: string
  participantIds: string[]
  month: string
  paid?: boolean
}
