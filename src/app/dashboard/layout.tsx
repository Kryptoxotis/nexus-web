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
      <div className="flex-1 flex flex-col">
        <header className="glass border-b border-nexus-border/50 px-6 py-3 flex items-center justify-between">
          {/* Left: breadcrumb glow line */}
          <div className="h-px flex-1 mr-6 max-w-xs" style={{ background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.3), transparent)' }} />
          <AuthButton email={user.email} />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
