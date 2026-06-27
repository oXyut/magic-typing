import { useState, useEffect, useRef, useCallback } from 'react'
import type { Card, GameMode, Format, RarityValue } from '../../domain/card'
import { fetchRandomCard } from '../../infrastructure/scryfallApi'

interface UseCardFetcherResult {
  currentCard: Card | null
  isLoading: boolean
  error: string | null
  advance: () => void
}

function pickRandom<T>(arr: T[], excludeIdx: number): { item: T; idx: number } {
  if (arr.length === 1) return { item: arr[0], idx: 0 }
  let idx: number
  do { idx = Math.floor(Math.random() * arr.length) } while (idx === excludeIdx)
  return { item: arr[idx], idx }
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
  const lastPoolIdxRef = useRef<number>(-1)

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
      const { item, idx } = pickRandom(deckPool, lastPoolIdxRef.current)
      lastPoolIdxRef.current = idx
      setCurrentCard(item)
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
      const { item, idx } = pickRandom(deckPool, lastPoolIdxRef.current)
      lastPoolIdxRef.current = idx
      setCurrentCard(item)
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
  }, [mode, format, rarities, deckPool, isDeckMode, fetchNext])

  return { currentCard, isLoading, error, advance }
}
