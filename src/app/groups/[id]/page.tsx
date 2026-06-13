import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { GroupDetail } from '@/features/groups/GroupDetail'

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/')
  const { id } = await params
  return <GroupDetail id={id} currentUserId={session.user.id} />
}
