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
    { label: 'Pending Requests', value: pendingRequests ?? 0, color: 'text-nexus-orange', variant: 'orange' },
    { label: 'Total Users', value: totalUsers ?? 0, color: 'text-nexus-blue', variant: 'blue' },
    { label: 'Total Organizations', value: totalOrgs ?? 0, color: 'text-nexus-blue-light', variant: 'blue' },
  ]

  const quickLinks = [
    { href: '/dashboard/admin/requests', label: 'Business Requests', description: 'Review and approve business account requests', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { href: '/dashboard/admin/users', label: 'User Management', description: 'View and manage all user accounts', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/dashboard/admin/orgs', label: 'Organizations', description: 'Manage organizations and their status', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-nexus-text-primary">Admin Dashboard</h1>

      {/* Stat cards with embossed gradient design */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.variant === 'orange' ? 'stat-card-orange' : ''} relative overflow-hidden rounded-2xl p-6`}>
            {/* Decorative corner gradient */}
            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{
              background: stat.variant === 'orange'
                ? 'radial-gradient(circle at top right, rgba(255, 107, 53, 0.08), transparent 70%)'
                : 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 70%)'
            }} />
            <p className="text-sm text-nexus-text-secondary font-medium">{stat.label}</p>
            <p className={`text-4xl font-bold mt-2 ${stat.color}`} style={{
              textShadow: stat.variant === 'orange'
                ? '0 0 20px rgba(255, 107, 53, 0.3)'
                : '0 0 20px rgba(59, 130, 246, 0.3)'
            }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links with neon hover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="neon-card rounded-2xl p-6 group"
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)' }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-nexus-blue/10 border border-nexus-blue/20 group-hover:bg-nexus-orange/10 group-hover:border-nexus-orange/20 transition-all">
              <svg className="w-5 h-5 text-nexus-blue group-hover:text-nexus-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
            </div>
            <h3 className="text-nexus-text-primary font-semibold group-hover:text-nexus-orange transition-colors">{link.label}</h3>
            <p className="text-sm text-nexus-text-secondary mt-1">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
