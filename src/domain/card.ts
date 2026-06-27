import type { ScryfallCard } from '../types/scryfall'

export type GameMode = 'name' | 'text'
export type Format = 'all' | 'standard' | 'pioneer' | 'modern' | 'legacy' | 'vintage' | 'pauper'
export type RarityValue = 'common' | 'uncommon' | 'rare' | 'mythic'

export interface GameConfig {
  mode: GameMode
  format: Format
  rarities: RarityValue[]
  durationMinutes: number
  soundEnabled: boolean
  /** デッキリストから読み込んだカードプール。セット時はランダム取得を使わない */
  deckPool?: Card[]
}

export interface FinalStats {
  wpm: number
  accuracy: number
  completedCards: number
}

export interface Card {
  id: string
  displayName: string
  typingTarget: string
  imageUrl: string
}

export function normalizeCard(raw: ScryfallCard, mode: GameMode): Card | null {
  const isDfc = Array.isArray(raw.card_faces) && raw.card_faces.length >= 2

  let imageUrl: string
  let typingTarget: string
  let displayName: string

  if (isDfc) {
    const faces = raw.card_faces!
    imageUrl = faces[0].image_uris?.normal ?? ''

    if (mode === 'name') {
      displayName = `${faces[0].name} // ${faces[1].name}`
      typingTarget = displayName
    } else {
      typingTarget = [faces[0].oracle_text ?? '', faces[1].oracle_text ?? '']
        .filter(Boolean).join(' / ')
      displayName = raw.name
    }
  } else {
    imageUrl = raw.image_uris?.normal ?? ''

    if (mode === 'name') {
      displayName = raw.name
      typingTarget = displayName
    } else {
      typingTarget = raw.oracle_text ?? ''
      displayName = raw.name
    }
  }

  if (!imageUrl || !typingTarget.trim()) return null

  return {
    id: raw.id,
    displayName,
    typingTarget: typingTarget.trim(),
    imageUrl,
  }
}
