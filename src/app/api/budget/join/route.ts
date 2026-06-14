import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/user'

const joinSchema = z.object({ code: z.string().min(1).max(64) })

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = joinSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  const code = parsed.data.code.trim().toLowerCase()
  const group = await prisma.group.findUnique({ where: { inviteCode: code } })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group.id, userId } },
    update: {},
    create: { groupId: group.id, userId },
  })

  return NextResponse.json({ id: group.id })
}
