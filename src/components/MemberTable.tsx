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
          <tr className="border-b border-nexus-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Member</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Uses</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Expires</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
          </tr>
        </thead>
        <tbody>
          {passes.map((pass) => (
            <tr key={pass.id} className="border-b border-nexus-border/50 hover:bg-nexus-surface-light/50">
              <td className="py-3 px-4">
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {pass.profile?.full_name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{pass.profile?.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                  pass.status === 'active' ? 'bg-nexus-green/20 text-nexus-green' :
                  pass.status === 'expired' ? 'bg-yellow-500/20 text-yellow-400' :
                  pass.status === 'revoked' ? 'bg-red-500/20 text-red-400' :
                  'bg-nexus-surface-light text-gray-400'
                }`}>
                  {pass.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-gray-400">
                {pass.use_count}
              </td>
              <td className="py-3 px-4 text-sm text-gray-400">
                {pass.expires_at ? new Date(pass.expires_at).toLocaleDateString() : 'Never'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {new Date(pass.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {passes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                No members yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
