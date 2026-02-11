'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthButton({ email }: { email?: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex items-center gap-3">
      {email && (
        <span className="text-sm text-nexus-text-secondary truncate max-w-[200px]">{email}</span>
      )}
      <button
        onClick={handleSignOut}
        className="px-3 py-1.5 text-sm text-nexus-text-secondary hover:text-white border border-nexus-border rounded-xl hover:bg-nexus-surface-light transition-all glow-blue-hover"
      >
        Sign Out
      </button>
    </div>
  )
}
