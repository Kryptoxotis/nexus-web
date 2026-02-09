'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AccessLog } from '@/lib/types'

export default function LogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('access_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    setLogs(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Access Logs</h1>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-nexus-surface rounded-xl border border-nexus-border">
          <svg className="w-12 h-12 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 mt-3">No access logs yet</p>
          <p className="text-gray-500 text-sm mt-1">Logs will appear when you use your NFC cards</p>
        </div>
      ) : (
        <div className="bg-nexus-surface rounded-xl border border-nexus-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Card ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-nexus-border/50 hover:bg-nexus-surface-light/50">
                  <td className="py-3 px-4 text-sm text-gray-300 capitalize">{log.card_type || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-400 font-mono">{log.card_id?.slice(0, 8) || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      log.access_granted
                        ? 'bg-nexus-teal/20 text-nexus-teal'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
