import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { splitEqually } from '@/lib/groups'

const patchSchema = z.object({
  paid: z.boolean().optional(),
  amount: z.number().int().positive().optional(),
  payerId: z.string().min(1).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, expenseId } = await params

  const member = await prisma.groupMember.findFirst({ where: { groupId: id, userId } })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 })

  const expense = await prisma.groupExpense.findFirst({
    where: { id: expenseId, groupId: id },
    include: { shares: true },
  })
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { paid, amount, payerId } = parsed.data
  if (payerId) {
    const validPayer = await prisma.groupMember.findFirst({ where: { groupId: id, userId: payerId } })
    if (!validPayer) return NextResponse.json({ error: 'Payer must be a member' }, { status: 400 })
  }

  if (amount && amount !== expense.amount) {
    const participantIds = expense.shares.map((share) => share.userId)
    const shares = splitEqually(amount, participantIds)
    await prisma.$transaction([
      prisma.groupExpenseShare.deleteMany({ where: { expenseId } }),
      prisma.groupExpense.update({
        where: { id: expenseId },
        data: {
          amount,
          ...(paid !== undefined ? { paid } : {}),
          ...(payerId ? { payerId } : {}),
          shares: { create: shares },
        },
      }),
    ])
  } else {
    await prisma.groupExpense.update({
      where: { id: expenseId },
      data: {
        ...(paid !== undefined ? { paid } : {}),
        ...(payerId ? { payerId } : {}),
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, expenseId } = await params

  const member = await prisma.groupMember.findFirst({ where: { groupId: id, userId } })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

  const result = await prisma.groupExpense.deleteMany({ where: { id: expenseId, groupId: id } })
  if (result.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
