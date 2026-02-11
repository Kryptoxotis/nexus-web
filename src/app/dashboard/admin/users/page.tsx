'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_USER_ID } from '@/lib/admin'
import type { Profile, AllowedEmail } from '@/lib/types'

type UserRow = (Profile & { _source: 'profile' }) | (AllowedEmail & { _source: 'allowlist' })

export default function AdminUsers() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    account_type: 'individual' as 'individual' | 'business',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  function flash(msg: string, type: 'error' | 'success') {
    if (type === 'error') { setError(msg); setSuccess(null) }
    else { setSuccess(msg); setError(null) }
    setTimeout(() => { setError(null); setSuccess(null) }, 5000)
  }

  async function fetchUsers() {
    setLoading(true)
    const [profilesRes, allowlistRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('allowed_emails').select('*').order('created_at', { ascending: false }),
    ])
    const profiles: UserRow[] = ((profilesRes.data as Profile[]) ?? []).map((p) => ({ ...p, _source: 'profile' as const }))
    const allowlist: UserRow[] = ((allowlistRes.data as AllowedEmail[]) ?? []).map((a) => ({ ...a, _source: 'allowlist' as const }))
    setUsers([...profiles, ...allowlist])
    setLoading(false)
  }

  async function toggleStatus(userId: string, currentStatus: string) {
    setActionLoading(userId)
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)
    if (error) flash(`Failed to update status: ${error.message}`, 'error')
    else flash(`User ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}`, 'success')
    setActionLoading(null)
    fetchUsers()
  }

  async function changeAccountType(userId: string, newType: 'individual' | 'business') {
    setActionLoading(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ account_type: newType })
      .eq('id', userId)
    if (error) flash(`Failed to change type: ${error.message}`, 'error')
    else flash(`Account type changed to ${newType}`, 'success')
    setActionLoading(null)
    fetchUsers()
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.full_name) return
    setCreating(true)
    const { error } = await supabase.rpc('admin_add_allowed_email', {
      p_email: form.email,
      p_full_name: form.full_name,
      p_account_type: form.account_type,
    })
    if (error) {
      flash(`Failed to add user: ${error.message}`, 'error')
    } else {
      flash(`"${form.full_name}" added`, 'success')
      setShowCreate(false)
      setForm({ email: '', full_name: '', account_type: 'individual' })
    }
    setCreating(false)
    fetchUsers()
  }

  async function deleteUser(row: UserRow) {
    const name = row.full_name || ('email' in row ? row.email : '') || 'Unknown'
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setActionLoading(row.id)
    if (row._source === 'profile') {
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: row.id })
      if (error) flash(`Failed to delete: ${error.message}`, 'error')
      else flash(`User "${name}" deleted`, 'success')
    } else {
      const { error } = await supabase.from('allowed_emails').delete().eq('id', row.id)
      if (error) flash(`Failed to delete: ${error.message}`, 'error')
      else flash(`Invite for "${name}" removed`, 'success')
    }
    setActionLoading(null)
    fetchUsers()
  }

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      ('email' in u && u.email?.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-nexus-text-primary">Users</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 text-sm font-medium text-white rounded-xl btn-primary"
        >
          {showCreate ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && (
        <div className="badge-danger px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="badge-active px-4 py-3 rounded-xl text-sm">{success}</div>
      )}

      {showCreate && (
        <form onSubmit={createUser} className="futuristic-form rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-nexus-text-secondary mb-1.5">Full Name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-nexus-text-primary placeholder-nexus-text-secondary/50 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-nexus-text-secondary mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-nexus-text-primary placeholder-nexus-text-secondary/50 focus:outline-none"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-nexus-text-secondary mb-1.5">Account Type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value as 'individual' | 'business' })}
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-nexus-text-primary focus:outline-none"
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !form.email || !form.full_name}
            className="px-5 py-2.5 text-sm font-medium text-white rounded-xl disabled:opacity-50 btn-secondary"
          >
            {creating ? 'Adding...' : 'Add User'}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 futuristic-input rounded-xl text-nexus-text-primary placeholder-nexus-text-secondary/50 focus:outline-none"
      />

      <div className="futuristic-table relative rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-nexus-text-secondary">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-nexus-text-secondary">No users found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-nexus-text-secondary">Date</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-nexus-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isProfile = row._source === 'profile'
                const isAdmin = isProfile && row.id === ADMIN_USER_ID
                const email = 'email' in row ? row.email : ''
                return (
                  <tr key={row.id} className="border-b border-nexus-border/50 last:border-0 transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-nexus-text-primary">{row.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-nexus-text-secondary">{email}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full badge-orange">
                          admin
                        </span>
                      ) : isProfile ? (
                        <select
                          value={(row as Profile).account_type}
                          onChange={(e) => changeAccountType(row.id, e.target.value as 'individual' | 'business')}
                          disabled={actionLoading === row.id}
                          className="futuristic-input text-nexus-text-primary text-xs rounded-xl px-2 py-1 focus:outline-none disabled:opacity-50"
                        >
                          <option value="individual">individual</option>
                          <option value="business">business</option>
                        </select>
                      ) : (
                        <span className="text-xs text-nexus-text-secondary">{row.account_type}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isProfile ? (
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${
                          (row as Profile).status === 'active'
                            ? 'badge-active'
                            : 'badge-danger'
                        }`}>
                          {(row as Profile).status}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full badge-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-nexus-text-secondary">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isAdmin && (
                        <div className="flex gap-2 justify-end">
                          {isProfile && (
                            <button
                              onClick={() => toggleStatus(row.id, (row as Profile).status)}
                              disabled={actionLoading === row.id}
                              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all disabled:opacity-50 text-white ${
                                (row as Profile).status === 'active'
                                  ? ''
                                  : 'btn-secondary'
                              }`}
                              style={(row as Profile).status === 'active' ? {
                                background: 'linear-gradient(135deg, #EAB308, #CA8A04)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                boxShadow: '0 2px 8px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                              } : undefined}
                            >
                              {(row as Profile).status === 'active' ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteUser(row)}
                            disabled={actionLoading === row.id}
                            className="px-3 py-1.5 text-xs font-medium rounded-xl transition-all disabled:opacity-50 text-white"
                            style={{
                              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
