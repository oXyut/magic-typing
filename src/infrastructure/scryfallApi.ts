import type { ScryfallCard } from '../types/scryfall'
import { normalizeCard, type Card, type GameMode, type Format, type RarityValue } from '../domain/card'

const BASE_URL = 'https://api.scryfall.com'
const MIN_INTERVAL_MS = 600

let lastFetchTime = 0

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastFetchTime
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, MIN_INTERVAL_MS - elapsed))
  }
  lastFetchTime = Date.now()
  return fetch(url, {
    headers: { 'User-Agent': 'MTGTypingGame/1.0', Accept: 'application/json' },
  })
}

export async function fetchRandomCard(
  mode: GameMode,
  format: Format = 'all',
  rarities: RarityValue[] = [],
  retries = 3,
): Promise<Card> {
  const parts: string[] = ['lang:en']
  if (format !== 'all') parts.push(`format:${format}`)
  if (rarities.length === 1) {
    parts.push(`rarity:${rarities[0]}`)
  } else if (rarities.length > 1) {
    parts.push(`(${rarities.map(r => `rarity:${r}`).join('+OR+')})`)
  }

  const url = `${BASE_URL}/cards/random?q=${parts.join('+')}`

  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await throttledFetch(url)
    if (!res.ok) {
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1000))
        continue
      }
      throw new Error(`Scryfall API error: ${res.status}`)
    }
    const raw: ScryfallCard = await res.json()
    const card = normalizeCard(raw, mode)
    if (card) return card
  }

  throw new Error('Could not fetch a usable card after retries')
}
