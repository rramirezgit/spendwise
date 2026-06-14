import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'
import { getUserGroupId } from '@/lib/budget-server'
import { DEFAULT_CATEGORIES } from '@/lib/categories'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json(null)

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: { include: { user: { select: { id: true, name: true, image: true } } } } },
  })
  if (!group) return NextResponse.json(null)

  return NextResponse.json({
    id: group.id,
    name: group.name,
    currency: group.currency,
    inviteCode: group.inviteCode,
    ownerId: group.ownerId,
    members: group.members.map((member) => ({
      userId: member.userId,
      name: member.user.name ?? 'Member',
      image: member.user.image,
    })),
  })
}

const createSchema = z.object({ name: z.string().min(1).max(40) })

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await getUserGroupId(userId)
  if (existing) return NextResponse.json({ id: existing })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })

  const group = await prisma.group.create({
    data: {
      name: parsed.data.name,
      inviteCode: randomBytes(4).toString('hex'),
      ownerId: userId,
      members: { create: { userId } },
      categories: {
        create: DEFAULT_CATEGORIES.map((category, index) => ({
          name: category.name,
          emoji: category.emoji,
          sortOrder: index,
        })),
      },
    },
  })

  return NextResponse.json({ id: group.id }, { status: 201 })
}

const patchSchema = z.object({
  currency: z.enum(['ARS', 'USD']).optional(),
  name: z.string().min(1).max(40).optional(),
})

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = await getUserGroupId(userId)
  if (!groupId) return NextResponse.json({ error: 'No budget' }, { status: 400 })

  const parsed = patchSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 })

  await prisma.group.update({ where: { id: groupId }, data: parsed.data })
  return NextResponse.json({ ok: true })
}
