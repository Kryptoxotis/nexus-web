'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organization } from '@/lib/types'

export default function BusinessPage() {
  const supabase = createClient()
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    enrollment_mode: 'open' as Organization['enrollment_mode'],
  })

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (data) {
      setOrg(data)
      setFormData({
        name: data.name,
        description: data.description || '',
        type: data.type || '',
        enrollment_mode: data.enrollment_mode,
      })
    }
    setLoading(false)
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('organizations').insert({
      owner_id: user.id,
      name: formData.name,
      description: formData.description || null,
      type: formData.type || null,
      enrollment_mode: formData.enrollment_mode,
    }).select().single()

    if (!error && data) {
      setOrg(data)
    }
  }

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org) return

    const { error } = await supabase.from('organizations')
      .update({
        name: formData.name,
        description: formData.description || null,
        type: formData.type || null,
        enrollment_mode: formData.enrollment_mode,
      })
      .eq('id', org.id)

    if (!error) {
      setOrg({ ...org, ...formData } as Organization)
      setEditing(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  const inputClass = "w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-nexus-orange focus:border-nexus-orange"

  if (!org) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Create Your Organization</h1>
        <form onSubmit={handleCreateOrg} className="bg-nexus-surface rounded-xl border border-nexus-border p-6 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Gold's Gym Downtown" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Tell people about your organization" rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g., Fitness, Office, Coworking" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Enrollment Mode</label>
              <select value={formData.enrollment_mode} onChange={e => setFormData({...formData, enrollment_mode: e.target.value as Organization['enrollment_mode']})} className={inputClass}>
                <option value="open">Open</option>
                <option value="pin">PIN Required</option>
                <option value="invite">Invite Only</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-nexus-orange text-white rounded-lg hover:bg-nexus-orange-hover transition-colors text-sm font-medium">
            Create Organization
          </button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Organization</h1>
        <button onClick={() => setEditing(!editing)} className="px-4 py-2 text-sm font-medium text-gray-300 border border-nexus-border rounded-lg hover:bg-nexus-surface-light transition-colors">
          {editing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleUpdateOrg} className="bg-nexus-surface rounded-xl border border-nexus-border p-6 max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Organization Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Enrollment Mode</label>
              <select value={formData.enrollment_mode} onChange={e => setFormData({...formData, enrollment_mode: e.target.value as Organization['enrollment_mode']})} className={inputClass}>
                <option value="open">Open</option>
                <option value="pin">PIN Required</option>
                <option value="invite">Invite Only</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 px-4 py-2 bg-nexus-orange text-white rounded-lg hover:bg-nexus-orange-hover transition-colors text-sm font-medium">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="bg-nexus-surface rounded-xl border border-nexus-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-nexus-orange to-nexus-green rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{org.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{org.name}</h2>
              {org.description && <p className="text-gray-400 mt-1">{org.description}</p>}
              <div className="flex gap-2 mt-2">
                {org.type && (
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-nexus-surface-light text-gray-300">{org.type}</span>
                )}
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-nexus-green/20 text-nexus-green capitalize">{org.enrollment_mode}</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Created: {new Date(org.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
