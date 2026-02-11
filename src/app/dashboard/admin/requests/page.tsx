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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [filter])

  async function fetchRequests() {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('business_requests')
      .select('*, profiles!business_requests_user_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    }
    setRequests((data as RequestWithProfile[]) ?? [])
    setLoading(false)
  }

  async function handleAction(requestId: string, userId: string, action: 'approved' | 'rejected') {
    setActionLoading(requestId)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from('business_requests')
      .update({
        status: action,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId)

    if (updateError) {
      setError(`Failed to ${action === 'approved' ? 'approve' : 'reject'}: ${updateError.message}`)
      setActionLoading(null)
      return
    }

    if (action === 'approved') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_type: 'business' })
        .eq('id', userId)

      if (profileError) {
        setError(`Request approved but failed to upgrade account: ${profileError.message}`)
      }
    }

    setActionLoading(null)
    fetchRequests()
  }

  async function resetRequest(requestId: string) {
    setActionLoading(requestId)
    setError(null)
    const { error: resetError } = await supabase
      .from('business_requests')
      .update({ status: 'pending', reviewed_by: null, reviewed_at: null })
      .eq('id', requestId)

    if (resetError) {
      setError(`Failed to reset: ${resetError.message}`)
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
      <h1 className="text-2xl font-bold text-nexus-text-primary">Business Requests</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === f.value
                ? 'bg-nexus-orange text-white glow-orange-hover'
                : 'bg-nexus-surface-light text-nexus-text-secondary hover:text-nexus-text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-nexus-surface card-glow rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-nexus-text-secondary">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-nexus-text-secondary">No requests found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Requester</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Business Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Message</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-nexus-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b border-nexus-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-sm text-nexus-text-primary">{req.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-nexus-text-secondary">{req.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-nexus-text-primary">{req.business_name}</td>
                  <td className="px-4 py-3 text-sm text-nexus-text-secondary">{req.business_type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-nexus-text-secondary max-w-xs truncate">{req.message || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                      req.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : req.status === 'approved'
                        ? 'bg-nexus-blue/20 text-nexus-blue'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-nexus-text-secondary">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {req.status === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleAction(req.id, req.user_id, 'approved')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 text-xs font-medium bg-nexus-blue hover:bg-nexus-blue-dark text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, req.user_id, 'rejected')}
                          disabled={actionLoading === req.id}
                          className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => resetRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="px-3 py-1 text-xs font-medium bg-nexus-surface-light hover:bg-nexus-border text-nexus-text-secondary hover:text-nexus-text-primary rounded-xl transition-colors disabled:opacity-50"
                      >
                        Reset to Pending
                      </button>
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
