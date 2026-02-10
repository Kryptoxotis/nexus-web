'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_USER_ID } from '@/lib/admin'
import type { Profile } from '@/lib/types'

export default function AdminUsers() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
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
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (fetchError) flash(fetchError.message, 'error')
    setUsers((data as Profile[]) ?? [])
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
    const { data, error } = await supabase.rpc('admin_create_user', {
      p_email: form.email,
      p_full_name: form.full_name,
      p_account_type: form.account_type,
    })
    if (error) {
      flash(`Failed to create user: ${error.message}`, 'error')
    } else {
      flash(`User "${form.full_name}" created`, 'success')
      setShowCreate(false)
      setForm({ email: '', full_name: '', account_type: 'individual' })
    }
    setCreating(false)
    fetchUsers()
  }

  async function deleteUser(userId: string, name: string) {
    if (!confirm(`Delete "${name}"? This removes all their data and cannot be undone.`)) return
    setActionLoading(userId)
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId })
    if (error) flash(`Failed to delete: ${error.message}`, 'error')
    else flash(`User "${name}" deleted`, 'success')
    setActionLoading(null)
    fetchUsers()
  }

  const filtered = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 text-sm font-medium bg-nexus-orange hover:bg-nexus-orange/80 text-white rounded-lg transition-colors"
        >
          {showCreate ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {showCreate && (
        <form onSubmit={createUser} className="bg-nexus-surface border border-nexus-border rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value as 'individual' | 'business' })}
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white focus:outline-none focus:border-nexus-orange/50"
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating || !form.email || !form.full_name}
            className="px-4 py-2 text-sm font-medium bg-nexus-green hover:bg-nexus-green-light text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create User'}
          </button>
        </form>
      )}

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nexus-orange/50"
      />

      <div className="bg-nexus-surface border border-nexus-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Joined</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isAdmin = user.id === ADMIN_USER_ID
                return (
                  <tr key={user.id} className="border-b border-nexus-border last:border-0">
                    <td className="px-4 py-3 text-sm text-white">{user.full_name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{user.email}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-nexus-orange/20 text-nexus-orange">
                          admin
                        </span>
                      ) : (
                        <select
                          value={user.account_type}
                          onChange={(e) => changeAccountType(user.id, e.target.value as 'individual' | 'business')}
                          disabled={actionLoading === user.id}
                          className="bg-nexus-surface-light border border-nexus-border text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-nexus-orange/50 disabled:opacity-50"
                        >
                          <option value="individual">individual</option>
                          <option value="business">business</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                        user.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isAdmin && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => toggleStatus(user.id, user.status)}
                            disabled={actionLoading === user.id}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                              user.status === 'active'
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => deleteUser(user.id, user.full_name || user.email || 'Unknown')}
                            disabled={actionLoading === user.id}
                            className="px-3 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
