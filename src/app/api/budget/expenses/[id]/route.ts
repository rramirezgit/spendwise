import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

const patchSchema = z.object({
  paid: z.boolean().optional(),
  amount: z.number().int().positive().optional(),
  payerId: z.string().nullable().optional(),
  splitPaid: z.boolean().optional(),
  name: z.string().min(1).max(80).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })
  const { id } = await params

  const expense = await prisma.budgetExpense.findFirst({ where: { id, groupId } })
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 })

  const { paid, amount, payerId, splitPaid, name } = parsed.data
  const data: Record<string, unknown> = {}
  if (paid !== undefined) {
    data.paid = paid
    data.paidAt = paid ? new Date() : null
  }
  if (amount !== undefined) data.amount = amount
  if (name !== undefined) data.name = name
  if (splitPaid !== undefined) {
    data.splitPaid = splitPaid
    if (splitPaid) data.payerId = null
  }
  if (payerId !== undefined && !splitPaid) {
    data.payerId = payerId
    data.splitPaid = false
  }

  await prisma.budgetExpense.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })
  const { id } = await params

  const expense = await prisma.budgetExpense.findFirst({ where: { id, groupId } })
  if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.budgetExpense.delete({ where: { id } })
  if (expense.isFixed && expense.fixedItemId) {
    await prisma.fixedItem.updateMany({ where: { id: expense.fixedItemId }, data: { archived: true } })
  }

  return NextResponse.json({ ok: true })
}
