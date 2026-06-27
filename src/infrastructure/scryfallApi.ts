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

export interface FetchDeckResult {
  cards: Card[]
  notFound: string[]
}

/**
 * Scryfall /cards/collection エンドポイントで最大 75 枚ずつバッチ取得する。
 */
export async function fetchCardsByNames(
  names: string[],
  mode: GameMode,
): Promise<FetchDeckResult> {
  const BATCH_SIZE = 75
  const allCards: Card[] = []
  const allNotFound: string[] = []

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise(r => setTimeout(r, 200))

    const batch = names.slice(i, i + BATCH_SIZE)
    const res = await fetch(`${BASE_URL}/cards/collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'User-Agent': 'MTGTypingGame/1.0',
        Accept: 'application/json',
      },
      body: JSON.stringify({ identifiers: batch.map(name => ({ name })) }),
    })

    if (!res.ok) throw new Error(`Scryfall API error: ${res.status}`)

    const data = await res.json()
    for (const raw of data.data as ScryfallCard[]) {
      const card = normalizeCard(raw, mode)
      if (card) allCards.push(card)
    }
    if (Array.isArray(data.not_found)) {
      for (const nf of data.not_found) {
        allNotFound.push((nf as { name?: string }).name ?? String(nf))
      }
    }
  }

  return { cards: allCards, notFound: allNotFound }
}
