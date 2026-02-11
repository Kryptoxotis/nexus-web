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
        className="px-3 py-1.5 text-sm text-nexus-text-secondary hover:text-nexus-text-primary rounded-xl transition-all"
        style={{
          background: 'linear-gradient(145deg, #1E293B, #111827)',
          border: '1px solid rgba(42, 54, 84, 0.6)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
