import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createClient()

  const [
    { count: pendingRequests },
    { count: totalUsers },
    { count: totalOrgs },
  ] = await Promise.all([
    supabase
      .from('business_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Pending Requests', value: pendingRequests ?? 0, color: 'text-nexus-orange' },
    { label: 'Total Users', value: totalUsers ?? 0, color: 'text-nexus-green' },
    { label: 'Total Organizations', value: totalOrgs ?? 0, color: 'text-blue-400' },
  ]

  const quickLinks = [
    { href: '/dashboard/admin/requests', label: 'Business Requests', description: 'Review and approve business account requests' },
    { href: '/dashboard/admin/users', label: 'User Management', description: 'View and manage all user accounts' },
    { href: '/dashboard/admin/orgs', label: 'Organizations', description: 'Manage organizations and their status' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-nexus-surface border border-nexus-border rounded-xl p-6">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-nexus-surface border border-nexus-border rounded-xl p-6 hover:border-nexus-orange/50 transition-colors group"
          >
            <h3 className="text-white font-semibold group-hover:text-nexus-orange transition-colors">{link.label}</h3>
            <p className="text-sm text-gray-400 mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
