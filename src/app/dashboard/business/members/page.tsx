'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MemberTable from '@/components/MemberTable'
import type { BusinessPass } from '@/lib/types'

export default function MembersPage() {
  const supabase = createClient()
  const [passes, setPasses] = useState<(BusinessPass & { profile?: { full_name: string | null; email: string | null } })[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!org) {
      setLoading(false)
      return
    }

    setOrgId(org.id)

    const { data } = await supabase
      .from('business_passes')
      .select(`
        *,
        profile:profiles!business_passes_user_id_fkey(full_name, email)
      `)
      .eq('organization_id', org.id)
      .order('created_at', { ascending: true })

    setPasses(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  if (!orgId) {
    return (
      <div className="text-center py-12">
        <p className="text-nexus-text-secondary">You need to create an organization first.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-nexus-text-primary">Members</h1>
        <span className="text-sm text-nexus-text-secondary">{passes.length} total</span>
      </div>

      <div className="bg-nexus-surface rounded-2xl card-glow">
        <MemberTable passes={passes} />
      </div>
    </div>
  )
}
