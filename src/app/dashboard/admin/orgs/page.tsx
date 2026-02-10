'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization, Profile } from '@/lib/types'

type OrgWithOwner = Organization & { profiles: Pick<Profile, 'email' | 'full_name'> | null }

export default function AdminOrgs() {
  const supabase = createClient()
  const [orgs, setOrgs] = useState<OrgWithOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchOrgs()
  }, [])

  async function fetchOrgs() {
    setLoading(true)
    const { data } = await supabase
      .from('organizations')
      .select('*, profiles!organizations_owner_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })
    setOrgs((data as OrgWithOwner[]) ?? [])
    setLoading(false)
  }

  async function toggleActive(orgId: string, currentlyActive: boolean) {
    setActionLoading(orgId)
    await supabase
      .from('organizations')
      .update({ is_active: !currentlyActive })
      .eq('id', orgId)
    setActionLoading(null)
    fetchOrgs()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Organizations</h1>

      <div className="bg-nexus-surface border border-nexus-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : orgs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No organizations found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Owner</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Enrollment</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Created</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-nexus-border last:border-0">
                  <td className="px-4 py-3 text-sm text-white font-medium">{org.name}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{org.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{org.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{org.type || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize bg-nexus-surface-light text-gray-400">
                      {org.enrollment_mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      org.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleActive(org.id, org.is_active)}
                      disabled={actionLoading === org.id}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        org.is_active
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {org.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
