import { prisma } from './prisma'

const DEMO_EMAIL = 'demo@spendwise.app'

export async function getCurrentUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: 'Demo' },
  })
  return user.id
}
