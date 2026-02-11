'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const errorParam = searchParams.get('error')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Sign-in error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nexus-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange" style={{ boxShadow: '0 0 15px rgba(255, 107, 53, 0.3)' }}></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-nexus-bg relative overflow-hidden">
      {/* Background decorative glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(255, 107, 53, 0.1), transparent 70%)' }} />

      <div className="max-w-md w-full mx-auto p-8 relative z-10">
        <div className="text-center mb-8">
          {/* Logo with prominent glow */}
          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
               style={{
                 background: 'linear-gradient(135deg, #FF6B35, #3B82F6)',
                 boxShadow: '0 0 30px rgba(255, 107, 53, 0.4), 0 0 60px rgba(59, 130, 246, 0.2), 0 8px 25px rgba(0, 0, 0, 0.5)'
               }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">Nexus</h1>
          <p className="text-nexus-text-secondary mt-2 text-sm">Your digital identity wallet</p>
        </div>

        {errorParam === 'not_allowed' && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm badge-danger">
            Your account is not authorized. Contact an administrator to request access.
          </div>
        )}

        {/* Login card with neon glow */}
        <div className="neon-card p-8">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)' }} />

          <p className="text-nexus-text-secondary text-sm text-center mb-6">Sign in to manage your Nexus cards</p>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-nexus-text-primary font-medium btn-primary"
            style={{
              background: 'linear-gradient(145deg, #1E293B, #111827)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.4)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.1), 0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-xs text-nexus-text-secondary mt-8 opacity-60">
          Manage your Nexus cards from anywhere
        </p>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-nexus-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
