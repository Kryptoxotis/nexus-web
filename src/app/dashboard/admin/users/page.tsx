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

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers((data as Profile[]) ?? [])
    setLoading(false)
  }

  async function toggleStatus(userId: string, currentStatus: string) {
    setActionLoading(userId)
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', userId)
    setActionLoading(null)
    fetchUsers()
  }

  async function changeAccountType(userId: string, newType: 'individual' | 'business') {
    setActionLoading(userId)
    await supabase
      .from('profiles')
      .update({ account_type: newType })
      .eq('id', userId)
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
      <h1 className="text-2xl font-bold text-white">Users</h1>

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
                        <button
                          onClick={() => toggleStatus(user.id, user.status)}
                          disabled={actionLoading === user.id}
                          className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                            user.status === 'active'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
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
