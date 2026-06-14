import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'

const schema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) })

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid month' }, { status: 400 })
  const { month } = parsed.data

  const templates = await prisma.fixedItem.findMany({ where: { groupId, archived: false } })
  const existing = await prisma.budgetExpense.findMany({
    where: { groupId, month, isFixed: true },
    select: { fixedItemId: true },
  })
  const present = new Set(existing.map((expense) => expense.fixedItemId))

  const toCreate = templates.filter((template) => !present.has(template.id))
  if (toCreate.length > 0) {
    await prisma.budgetExpense.createMany({
      data: toCreate.map((template) => ({
        groupId,
        month,
        name: template.name,
        amount: template.amount,
        category: template.category,
        payerId: template.payerId,
        splitPaid: template.splitPaid,
        isFixed: true,
        fixedItemId: template.id,
      })),
    })
  }

  return NextResponse.json({ created: toCreate.length })
}
