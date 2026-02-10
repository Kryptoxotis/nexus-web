import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_USER_ID } from '@/lib/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== ADMIN_USER_ID) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
