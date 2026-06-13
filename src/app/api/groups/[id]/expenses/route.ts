import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { CATEGORIES } from '@/lib/categories'
import { splitEqually } from '@/lib/groups'

const createSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().min(1).max(80),
  category: z.enum(CATEGORIES.map((category) => category.id) as [string, ...string[]]),
  payerId: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  paid: z.boolean().optional(),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid expense' }, { status: 400 })

  const members = await prisma.groupMember.findMany({ where: { groupId: id } })
  const memberIds = new Set(members.map((member) => member.userId))
  if (!memberIds.has(userId)) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const { amount, description, category, payerId, participantIds, month, paid } = parsed.data
  if (!memberIds.has(payerId) || !participantIds.every((pid) => memberIds.has(pid))) {
    return NextResponse.json({ error: 'Payer and participants must be members' }, { status: 400 })
  }

  const shares = splitEqually(amount, participantIds)

  const expense = await prisma.groupExpense.create({
    data: {
      groupId: id,
      payerId,
      amount,
      description,
      category,
      month,
      paid: paid ?? false,
      shares: { create: shares },
    },
  })

  return NextResponse.json(expense, { status: 201 })
}
