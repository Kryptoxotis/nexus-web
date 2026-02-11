'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single<Profile>()

    if (data) {
      setProfile(data)
      setFullName(data.full_name || '')
    }
    setLoading(false)
  }

  const handleUpdateName = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, full_name: fullName })
    }
    setSaving(false)
  }

  const handleSwitchAccountType = async (type: Profile['account_type']) => {
    if (!profile) return

    const { error } = await supabase
      .from('profiles')
      .update({ account_type: type })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, account_type: type })
      router.refresh()
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-nexus-text-primary mb-6">Settings</h1>

      {/* Profile Section */}
      <section className="bg-nexus-surface rounded-2xl card-glow p-6 mb-6">
        <h2 className="text-lg font-semibold text-nexus-text-primary mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-1">Email</label>
            <p className="text-sm text-nexus-text-secondary">{profile?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-nexus-text-secondary mb-1">Full Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="flex-1 px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-xl text-sm text-nexus-text-primary input-glow focus:outline-none"
              />
              <button
                onClick={handleUpdateName}
                disabled={saving || fullName === profile?.full_name}
                className="px-4 py-2 bg-nexus-orange text-white rounded-xl hover:bg-nexus-orange-hover transition-all text-sm font-medium disabled:opacity-50 glow-orange-hover"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Account Type Section */}
      <section className="bg-nexus-surface rounded-2xl card-glow p-6 mb-6">
        <h2 className="text-lg font-semibold text-nexus-text-primary mb-4">Account Type</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSwitchAccountType('individual')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              profile?.account_type === 'individual'
                ? 'border-nexus-orange bg-nexus-orange/10'
                : 'border-nexus-border hover:border-nexus-surface-light'
            }`}
          >
            <p className="font-semibold text-nexus-text-primary">Individual</p>
            <p className="text-sm text-nexus-text-secondary mt-1">Use and manage your own cards</p>
          </button>
          <button
            onClick={() => handleSwitchAccountType('business')}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              profile?.account_type === 'business'
                ? 'border-nexus-blue bg-nexus-blue/10'
                : 'border-nexus-border hover:border-nexus-surface-light'
            }`}
          >
            <p className="font-semibold text-nexus-text-primary">Business</p>
            <p className="text-sm text-nexus-text-secondary mt-1">Issue passes for your organization</p>
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-nexus-surface rounded-2xl border border-red-900/50 p-6">
        <h2 className="text-lg font-semibold text-red-400 mb-4">Sign Out</h2>
        <p className="text-sm text-nexus-text-secondary mb-4">Sign out from the web dashboard. Your cards will remain on your phone.</p>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Sign Out
        </button>
      </section>
    </div>
  )
}
