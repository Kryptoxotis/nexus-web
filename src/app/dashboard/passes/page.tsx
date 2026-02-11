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
      await supabase.from('personal_cards').update({ is_active: false }).eq('user_id', user.id)
      await supabase.from('personal_cards').update({ is_active: true }).eq('id', id)
    } else {
      await supabase.from('personal_cards').update({ is_active: false }).eq('id', id)
    }
    fetchCards()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexus-orange" style={{ boxShadow: '0 0 15px rgba(255, 107, 53, 0.3)' }}></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-nexus-text-primary">My Cards</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-2.5 text-white rounded-xl text-sm font-medium btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add Card'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCard} className="futuristic-form rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-1.5">Card Type *</label>
              <select
                value={formData.card_type}
                onChange={e => setFormData({...formData, card_type: e.target.value as PersonalCard['card_type']})}
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-sm text-nexus-text-primary focus:outline-none"
              >
                {CARD_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nexus-text-secondary mb-1.5">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., My Website"
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-sm text-nexus-text-primary placeholder-nexus-text-secondary/50 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-nexus-text-secondary mb-1.5">Content</label>
              <input
                type="text"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                placeholder="URL, contact info, or any text"
                className="w-full px-3 py-2.5 futuristic-input rounded-xl text-sm text-nexus-text-primary placeholder-nexus-text-secondary/50 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-5 py-2.5 text-white rounded-xl text-sm font-medium btn-primary"
          >
            Add Card
          </button>
        </form>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-16 neon-card rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-nexus-blue/10 border border-nexus-blue/20">
            <svg className="w-8 h-8 text-nexus-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-nexus-text-primary font-medium">No cards yet</p>
          <p className="text-nexus-text-secondary text-sm mt-1">Add a card from the Android app or click &quot;Add Card&quot; above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
