'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import BusinessCard from '@/components/BusinessCard'
import type { Organization } from '@/lib/types'

export default function BusinessDirectoryPage() {
  const supabase = createClient()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    setOrgs(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-nexus-text-primary mb-6">Organizations</h1>

      {orgs.length === 0 ? (
        <div className="text-center py-12 bg-nexus-surface rounded-2xl card-glow">
          <svg className="w-12 h-12 text-nexus-text-secondary mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-nexus-text-secondary mt-3">No organizations available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orgs.map(org => (
            <BusinessCard key={org.id} organization={org} />
          ))}
        </div>
      )}
    </div>
  )
}
