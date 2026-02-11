import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has a profile (existing user or just provisioned by allowlist trigger)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (profile) {
          return NextResponse.redirect(`${origin}${next}`)
        }

        // No profile = not on the allowlist, sign out and block
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/?error=not_allowed`)
      }
    }
  }

  // Return to login on error
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`)
}
