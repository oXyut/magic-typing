import { useState, useEffect, useRef, useCallback } from 'react'
import type { Card, GameMode, Format, RarityValue } from '../../domain/card'
import { fetchRandomCard } from '../../infrastructure/scryfallApi'

interface UseCardFetcherResult {
  currentCard: Card | null
  isLoading: boolean
  error: string | null
  advance: () => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useCardFetcher(
  mode: GameMode,
  format: Format,
  rarities: RarityValue[],
  deckPool?: Card[],
): UseCardFetcherResult {
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const nextCardRef = useRef<Card | null>(null)
  const isFetchingNext = useRef(false)

  // デッキモード用: シャッフル済みキュー（末尾から pop する）
  const deckQueueRef = useRef<Card[]>([])
  const prevDeckPoolRef = useRef<Card[] | undefined>(undefined)

  const nextFromDeck = useCallback((pool: Card[]): Card => {
    // プールが変わったらキューをリセット
    if (pool !== prevDeckPoolRef.current) {
      prevDeckPoolRef.current = pool
      deckQueueRef.current = []
    }
    // キューが空になったら再シャッフルして補充
    if (deckQueueRef.current.length === 0) {
      deckQueueRef.current = shuffle(pool)
    }
    return deckQueueRef.current.pop()!
  }, [])

  const isDeckMode = deckPool && deckPool.length > 0

  const fetchNext = useCallback(async () => {
    if (isDeckMode) return
    if (isFetchingNext.current) return
    isFetchingNext.current = true
    try {
      const card = await fetchRandomCard(mode, format, rarities)
      nextCardRef.current = card
    } catch {
      // silent
    } finally {
      isFetchingNext.current = false
    }
  }, [mode, format, rarities, isDeckMode])

  useEffect(() => {
    setError(null)

    if (isDeckMode) {
      setCurrentCard(nextFromDeck(deckPool))
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    nextCardRef.current = null

    fetchRandomCard(mode, format, rarities)
      .then((card) => {
        setCurrentCard(card)
        setIsLoading(false)
        fetchNext()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, format, rarities, deckPool, fetchNext])

  const advance = useCallback(() => {
    if (isDeckMode) {
      setCurrentCard(nextFromDeck(deckPool))
      return
    }

    if (nextCardRef.current) {
      setCurrentCard(nextCardRef.current)
      nextCardRef.current = null
      fetchNext()
    } else {
      setIsLoading(true)
      fetchRandomCard(mode, format, rarities)
        .then((card) => {
          setCurrentCard(card)
          setIsLoading(false)
          fetchNext()
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setIsLoading(false)
        })
    }
  }, [mode, format, rarities, deckPool, isDeckMode, nextFromDeck, fetchNext])

  return { currentCard, isLoading, error, advance }
}
