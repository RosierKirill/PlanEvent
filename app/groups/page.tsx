import { redirect } from 'next/navigation'

export default function GroupsPage() {
  // legacy route: redirect to /rooms
  redirect('/rooms')
}