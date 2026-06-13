import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'

const monthSchema = z.string().regex(/^\d{4}-\d{2}$/)

export async function GET(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = new URL(request.url).searchParams.get('month')
  const parsed = monthSchema.safeParse(month)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid month' }, { status: 400 })

  const payments = await prisma.fixedPayment.findMany({
    where: { userId, month: parsed.data },
  })
  return NextResponse.json(payments)
}

const createSchema = z.object({
  recurringId: z.string().min(1),
  month: monthSchema,
})

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment' }, { status: 400 })

  const { recurringId, month } = parsed.data
  const owns = await prisma.recurringExpense.findFirst({ where: { id: recurringId, userId } })
  if (!owns) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const payment = await prisma.fixedPayment.upsert({
    where: { recurringId_month: { recurringId, month } },
    update: {},
    create: { recurringId, month, userId },
  })
  return NextResponse.json(payment, { status: 201 })
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = new URL(request.url).searchParams
  const recurringId = params.get('recurringId') ?? ''
  const month = params.get('month') ?? ''

  await prisma.fixedPayment.deleteMany({ where: { userId, recurringId, month } })
  return NextResponse.json({ ok: true })
}
