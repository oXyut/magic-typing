import type { ScryfallCard } from '../types/scryfall'

export type GameMode = 'name' | 'text'
export type Language = 'en' | 'ja'
export type Format = 'all' | 'standard' | 'pioneer' | 'modern' | 'legacy' | 'vintage' | 'pauper'
export type RarityValue = 'common' | 'uncommon' | 'rare' | 'mythic'

export interface GameConfig {
  mode: GameMode
  lang: Language
  format: Format
  rarities: RarityValue[]   // 空配列 = すべてのレア度
  durationMinutes: number
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

export function normalizeCard(
  raw: ScryfallCard,
  mode: GameMode,
  lang: Language,
): Card | null {
  const isDfc = Array.isArray(raw.card_faces) && raw.card_faces.length >= 2

  let imageUrl: string
  let typingTarget: string
  let displayName: string

  if (isDfc) {
    const faces = raw.card_faces!
    const face0 = faces[0]
    const face1 = faces[1]

    imageUrl = face0.image_uris?.normal ?? ''

    if (mode === 'name') {
      const name0 = lang === 'ja' ? (face0.printed_name ?? face0.name) : face0.name
      const name1 = lang === 'ja' ? (face1.printed_name ?? face1.name) : face1.name
      displayName = `${name0} // ${name1}`
      typingTarget = displayName
    } else {
      const text0 = lang === 'ja'
        ? (face0.printed_text ?? face0.oracle_text ?? '')
        : (face0.oracle_text ?? '')
      const text1 = lang === 'ja'
        ? (face1.printed_text ?? face1.oracle_text ?? '')
        : (face1.oracle_text ?? '')
      typingTarget = [text0, text1].filter(Boolean).join(' / ')
      displayName = lang === 'ja' ? (raw.printed_name ?? raw.name) : raw.name
    }
  } else {
    imageUrl = raw.image_uris?.normal ?? ''

    if (mode === 'name') {
      displayName = lang === 'ja' ? (raw.printed_name ?? raw.name) : raw.name
      typingTarget = displayName
    } else {
      typingTarget = lang === 'ja'
        ? (raw.printed_text ?? raw.oracle_text ?? '')
        : (raw.oracle_text ?? '')
      displayName = lang === 'ja' ? (raw.printed_name ?? raw.name) : raw.name
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
