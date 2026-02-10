'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BusinessRequest, Profile } from '@/lib/types'

type RequestWithProfile = BusinessRequest & { profiles: Pick<Profile, 'email' | 'full_name'> | null }
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminRequests() {
  const supabase = createClient()
  const [requests, setRequests] = useState<RequestWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [filter])

  async function fetchRequests() {
    setLoading(true)
    let query = supabase
      .from('business_requests')
      .select('*, profiles!business_requests_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setRequests((data as RequestWithProfile[]) ?? [])
    setLoading(false)
  }

  async function handleAction(requestId: string, userId: string, action: 'approved' | 'rejected') {
    setActionLoading(requestId)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('business_requests')
      .update({
        status: action,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (!error && action === 'approved') {
      await supabase
        .from('profiles')
        .update({ account_type: 'business' })
        .eq('id', userId)
    }

    setActionLoading(null)
    fetchRequests()
  }

  const filters: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Business Requests</h1>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-nexus-orange text-white'
                : 'bg-nexus-surface-light text-gray-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-nexus-surface border border-nexus-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No requests found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Requester</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Business Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-nexus-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white">{req.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{req.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{req.business_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{req.business_type || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                      req.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : req.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAction(req.id, req.user_id, 'approved')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, req.user_id, 'rejected')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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
