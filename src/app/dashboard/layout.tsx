import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'
import AuthButton from '@/components/AuthButton'
import type { Profile } from '@/lib/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return (
    <div className="flex min-h-screen bg-nexus-bg">
      <Sidebar profile={profile} />
      <div className="flex-1">
        <header className="glass border-b border-nexus-border px-6 py-3 flex items-center justify-end">
          <AuthButton email={user.email} />
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
