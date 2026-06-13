import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'

const createSchema = z.object({
  amount: z.number().int().positive(),
  kind: z.enum(['deposit', 'withdraw']),
  note: z.string().max(120).optional(),
})

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const savings = await prisma.saving.findMany({
    where: { userId },
    orderBy: { savedAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(savings)
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid saving' }, { status: 400 })
  }

  const saving = await prisma.saving.create({
    data: { ...parsed.data, userId },
  })
  return NextResponse.json(saving, { status: 201 })
}
