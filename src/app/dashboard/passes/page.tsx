'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PassCard from '@/components/PassCard'
import type { PersonalCard } from '@/lib/types'

const CARD_TYPES = ['link', 'file', 'contact', 'social_media', 'custom'] as const

export default function PassesPage() {
  const supabase = createClient()
  const [cards, setCards] = useState<PersonalCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    card_type: 'link' as PersonalCard['card_type'],
    title: '',
    content: '',
  })

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('personal_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })

    setCards(data || [])
    setLoading(false)
  }

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const nextOrder = cards.length > 0 ? Math.max(...cards.map(c => c.order_index)) + 1 : 0

    const { error } = await supabase.from('personal_cards').insert({
      user_id: user.id,
      card_type: formData.card_type,
      title: formData.title,
      content: formData.content || null,
      order_index: nextOrder,
    })

    if (!error) {
      setFormData({ card_type: 'link', title: '', content: '' })
      setShowAddForm(false)
      fetchCards()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return

    const { error } = await supabase.from('personal_cards').delete().eq('id', id)
    if (!error) {
      setCards(cards.filter(c => c.id !== id))
    }
  }

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!currentlyActive) {
      // Deactivate all first, then activate this one
      await supabase.from('personal_cards').update({ is_active: false }).eq('user_id', user.id)
      await supabase.from('personal_cards').update({ is_active: true }).eq('id', id)
    } else {
      await supabase.from('personal_cards').update({ is_active: false }).eq('id', id)
    }
    fetchCards()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange"></div></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">My Cards</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-nexus-orange text-white rounded-lg hover:bg-nexus-orange-hover transition-colors text-sm font-medium"
        >
          {showAddForm ? 'Cancel' : 'Add Card'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCard} className="bg-nexus-surface rounded-xl border border-nexus-border p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Card Type *</label>
              <select
                value={formData.card_type}
                onChange={e => setFormData({...formData, card_type: e.target.value as PersonalCard['card_type']})}
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-sm text-gray-200 focus:ring-2 focus:ring-nexus-orange focus:border-nexus-orange"
              >
                {CARD_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., My Website"
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-nexus-orange focus:border-nexus-orange"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
              <input
                type="text"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="URL, contact info, or any text"
                className="w-full px-3 py-2 bg-nexus-surface-light border border-nexus-border rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-nexus-orange focus:border-nexus-orange"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-nexus-orange text-white rounded-lg hover:bg-nexus-orange-hover transition-colors text-sm font-medium"
          >
            Add Card
          </button>
        </form>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-12 bg-nexus-surface rounded-xl border border-nexus-border">
          <svg className="w-12 h-12 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-400 mt-3">No cards yet</p>
          <p className="text-gray-500 text-sm mt-1">Add a card from the Android app or click &quot;Add Card&quot; above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <PassCard
              key={card.id}
              card={card}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}
