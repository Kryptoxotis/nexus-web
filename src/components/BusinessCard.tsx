'use client'

import type { Organization } from '@/lib/types'

interface BusinessCardProps {
  organization: Organization
  isOwner?: boolean
}

export default function BusinessCard({ organization, isOwner }: BusinessCardProps) {
  return (
    <div className="bg-nexus-surface rounded-2xl card-glow p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-nexus-orange to-nexus-blue rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-white">
            {organization.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-nexus-text-primary">{organization.name}</h3>
            {isOwner && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-nexus-orange/20 text-nexus-orange">
                Owner
              </span>
            )}
            {!organization.is_active && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-nexus-surface-light text-nexus-text-secondary">
                Inactive
              </span>
            )}
          </div>
          {organization.description && (
            <p className="text-sm text-nexus-text-secondary mt-1">{organization.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            {organization.type && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-nexus-surface-light text-nexus-text-secondary">
                {organization.type}
              </span>
            )}
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-nexus-blue/20 text-nexus-blue capitalize">
              {organization.enrollment_mode}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
