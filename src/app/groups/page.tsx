import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { GroupsView } from '@/features/groups/GroupsView'

export default async function GroupsPage() {
  const session = await auth()
  if (!session?.user) redirect('/')
  return <GroupsView />
}
