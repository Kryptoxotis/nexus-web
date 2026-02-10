import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

export default async function DashboardHome() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (profile?.account_type === 'admin') {
    redirect('/dashboard/admin')
  }

  if (profile?.account_type === 'business') {
    redirect('/dashboard/business')
  }

  redirect('/dashboard/passes')
}
