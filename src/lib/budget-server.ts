import { prisma } from './prisma'

export async function getUserGroupId(userId: string): Promise<string | null> {
  const membership = await prisma.groupMember.findFirst({
    where: { userId },
    orderBy: { joinedAt: 'asc' },
  })
  return membership?.groupId ?? null
}
