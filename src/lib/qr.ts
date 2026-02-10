import type { PersonalCard } from './types'

function resolveUrl(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

function looksLikeUrl(text: string): boolean {
  const t = text.trim().toLowerCase()
  return (
    t.startsWith('http://') ||
    t.startsWith('https://') ||
    t.startsWith('www.') ||
    /^[a-z0-9-]+\.[a-z]{2,}/.test(t)
  )
}

function resolveContact(name: string, content: string): string {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const parts: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`]

  for (const line of lines) {
    if (line.includes('@')) {
      parts.push(`EMAIL:${line}`)
    } else if (/^[+\d\s()-]{7,}$/.test(line)) {
      parts.push(`TEL:${line}`)
    } else if (looksLikeUrl(line)) {
      parts.push(`URL:${resolveUrl(line)}`)
    } else {
      parts.push(`NOTE:${line}`)
    }
  }

  parts.push('END:VCARD')
  return parts.join('\n')
}

export function resolveQrContent(card: PersonalCard): string {
  const content = card.content
  if (!content) return card.title

  switch (card.card_type) {
    case 'link':
      return resolveUrl(content)
    case 'file':
      return resolveUrl(content)
    case 'contact':
      return resolveContact(card.title, content)
    case 'social_media':
      return resolveUrl(content)
    case 'custom':
      return looksLikeUrl(content) ? resolveUrl(content) : content
    default:
      return content
  }
}
