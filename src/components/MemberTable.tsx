'use client'

import type { BusinessPass } from '@/lib/types'

interface MemberTableProps {
  passes: (BusinessPass & { profile?: { full_name: string | null; email: string | null } })[]
}

export default function MemberTable({ passes }: MemberTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-nexus-border" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
            <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">Member</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">Uses</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">Expires</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-nexus-text-secondary">Joined</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((pass) => (
            <tr key={pass.id} className="border-b border-nexus-border/50 transition-colors hover:bg-white/[0.02]">
              <td className="py-3 px-4">
                <div>
                  <p className="text-sm font-medium text-nexus-text-primary">
                    {pass.profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-nexus-text-secondary">{pass.profile?.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  pass.status === 'active' ? 'badge-active' :
                  pass.status === 'expired' ? 'badge-warning' :
                  pass.status === 'revoked' ? 'badge-danger' :
                  'bg-nexus-surface-light text-nexus-text-secondary'
                }`}>
                  {pass.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-nexus-text-secondary">
                {pass.use_count}
              </td>
              <td className="py-3 px-4 text-sm text-nexus-text-secondary">
                {pass.expires_at ? new Date(pass.expires_at).toLocaleDateString() : 'Never'}
              </td>
              <td className="py-3 px-4 text-sm text-nexus-text-secondary">
                {new Date(pass.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {passes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-nexus-text-secondary">
                No members yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
