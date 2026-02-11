'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { PersonalCard } from '@/lib/types'
import { resolveQrContent } from '@/lib/qr'

const typeIcons: Record<PersonalCard['card_type'], string> = {
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101',
  file: 'M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13',
  contact: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  social_media: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z',
  custom: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
}

interface PassCardProps {
  card: PersonalCard
  onDelete?: (id: string) => void
  onToggleActive?: (id: string, currentlyActive: boolean) => void
}

export default function PassCard({ card, onDelete, onToggleActive }: PassCardProps) {
  const [showQr, setShowQr] = useState(false)

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
      card.is_active ? 'neon-card neon-card-orange' : 'futuristic-card'
    }`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: card.is_active
          ? 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.5), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
      }} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              card.is_active
                ? 'bg-nexus-orange/10 border border-nexus-orange/20'
                : 'bg-nexus-blue/10 border border-nexus-blue/20'
            }`}>
              <svg className={`w-4 h-4 ${card.is_active ? 'text-nexus-orange' : 'text-nexus-blue'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[card.card_type]} />
              </svg>
            </div>
            <span className="text-xs text-nexus-text-secondary capitalize font-medium">{card.card_type.replace('_', ' ')}</span>
          </div>
          <h3 className="font-semibold text-nexus-text-primary text-base">{card.title}</h3>
          {card.content && (
            <p className="text-sm text-nexus-text-secondary mt-1 truncate">{card.content}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-2">
          {card.is_active && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full animate-pulse-glow badge-orange">
              Active
            </span>
          )}
          <button
            onClick={() => setShowQr(!showQr)}
            className={`p-2 rounded-lg transition-all ${
              showQr
                ? 'text-nexus-orange bg-nexus-orange/10 border border-nexus-orange/20'
                : 'text-nexus-text-secondary hover:text-nexus-blue hover:bg-nexus-blue/10'
            }`}
            title={showQr ? 'Hide QR' : 'Show QR'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </button>
          {onToggleActive && (
            <button
              onClick={() => onToggleActive(card.id, card.is_active)}
              className={`p-2 rounded-lg transition-all ${
                card.is_active
                  ? 'text-nexus-orange hover:bg-nexus-orange/10'
                  : 'text-nexus-text-secondary hover:text-nexus-blue hover:bg-nexus-blue/10'
              }`}
              title={card.is_active ? 'Deactivate' : 'Activate for NFC'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.is_active ? 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 text-nexus-text-secondary hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showQr && (
        <div className="mt-4 flex flex-col items-center">
          <div className="bg-white p-3 rounded-xl" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), 0 4px 15px rgba(0, 0, 0, 0.3)' }}>
            <QRCodeSVG
              value={resolveQrContent(card)}
              size={160}
              level="M"
            />
          </div>
          <p className="text-xs text-nexus-text-secondary mt-2">Scan to share</p>
        </div>
      )}
    </div>
  )
}
