'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization, Profile } from '@/lib/types'

type OrgWithOwner = Organization & { profiles: Pick<Profile, 'email' | 'full_name'> | null }

export default function AdminOrgs() {
  const supabase = createClient()
  const [orgs, setOrgs] = useState<OrgWithOwner[]>([])
  const [users, setUsers] = useState<Pick<Profile, 'id' | 'email' | 'full_name'>[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    type: '',
    description: '',
    owner_id: '',
    enrollment_mode: 'open' as 'open' | 'pin' | 'invite' | 'closed',
  })

  useEffect(() => {
    fetchOrgs()
    fetchUsers()
  }, [])

  function flash(msg: string, type: 'error' | 'success') {
    if (type === 'error') { setError(msg); setSuccess(null) }
    else { setSuccess(msg); setError(null) }
    setTimeout(() => { setError(null); setSuccess(null) }, 5000)
  }

  async function fetchOrgs() {
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('organizations')
      .select('*, profiles!organizations_owner_id_fkey(email, full_name)')
      .order('created_at', { ascending: false })
    if (fetchError) flash(fetchError.message, 'error')
    setOrgs((data as OrgWithOwner[]) ?? [])
    setLoading(false)
  }

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .order('full_name')
    setUsers(data ?? [])
  }

  async function toggleActive(orgId: string, currentlyActive: boolean) {
    setActionLoading(orgId)
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: !currentlyActive })
      .eq('id', orgId)
    if (error) flash(`Failed to toggle: ${error.message}`, 'error')
    else flash(`Organization ${currentlyActive ? 'deactivated' : 'activated'}`, 'success')
    setActionLoading(null)
    fetchOrgs()
  }

  async function deleteOrg(orgId: string, orgName: string) {
    if (!confirm(`Delete "${orgName}"? This cannot be undone.`)) return
    setActionLoading(orgId)
    const { error } = await supabase.from('organizations').delete().eq('id', orgId)
    if (error) flash(`Failed to delete: ${error.message}`, 'error')
    else flash(`"${orgName}" deleted`, 'success')
    setActionLoading(null)
    fetchOrgs()
  }

  async function createOrg(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.owner_id) return
    setCreating(true)
    const { error } = await supabase.from('organizations').insert({
      name: form.name,
      type: form.type || null,
      description: form.description || null,
      owner_id: form.owner_id,
      enrollment_mode: form.enrollment_mode,
      is_active: true,
    })
    if (error) {
      flash(`Failed to create: ${error.message}`, 'error')
    } else {
      flash(`"${form.name}" created`, 'success')
      setShowCreate(false)
      setForm({ name: '', type: '', description: '', owner_id: '', enrollment_mode: 'open' })
    }
    setCreating(false)
    fetchOrgs()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Organizations</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 text-sm font-medium bg-nexus-orange hover:bg-nexus-orange/80 text-white rounded-lg transition-colors"
        >
          {showCreate ? 'Cancel' : 'Create Organization'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {showCreate && (
        <form onSubmit={createOrg} className="bg-nexus-surface border border-nexus-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50"
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <input
                type="text"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50"
                placeholder="e.g. Technology, Food & Beverage"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Owner *</label>
              <select
                value={form.owner_id}
                onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                required
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white focus:outline-none focus:border-nexus-orange/50"
              >
                <option value="">Select owner...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Enrollment Mode</label>
              <select
                value={form.enrollment_mode}
                onChange={(e) => setForm({ ...form, enrollment_mode: e.target.value as typeof form.enrollment_mode })}
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white focus:outline-none focus:border-nexus-orange/50"
              >
                <option value="open">Open</option>
                <option value="pin">PIN</option>
                <option value="invite">Invite</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50 resize-none"
              placeholder="Brief description..."
            />
          </div>
          <button
            type="submit"
            disabled={creating || !form.name || !form.owner_id}
            className="px-4 py-2 text-sm font-medium bg-nexus-green hover:bg-nexus-green-light text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

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
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-nexus-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{org.name}</p>
                    {org.description && <p className="text-xs text-gray-500 mt-0.5">{org.description}</p>}
                  </td>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => toggleActive(org.id, org.is_active)}
                        disabled={actionLoading === org.id}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          org.is_active
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {org.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteOrg(org.id, org.name)}
                        disabled={actionLoading === org.id}
                        className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
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
