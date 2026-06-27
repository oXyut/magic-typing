import { useState, useEffect, useRef, useCallback } from 'react'
import type { Card, GameMode, Language } from '../../domain/card'
import { fetchRandomCard } from '../../infrastructure/scryfallApi'

interface UseCardFetcherResult {
  currentCard: Card | null
  isLoading: boolean
  error: string | null
  advance: () => void
}

export function useCardFetcher(mode: GameMode, lang: Language): UseCardFetcherResult {
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const nextCardRef = useRef<Card | null>(null)
  const isFetchingNext = useRef(false)

  const fetchNext = useCallback(async () => {
    if (isFetchingNext.current) return
    isFetchingNext.current = true
    try {
      const card = await fetchRandomCard(mode, lang)
      nextCardRef.current = card
    } catch {
      // preload failure is silent; fetchOnAdvance will handle it
    } finally {
      isFetchingNext.current = false
    }
  }, [mode, lang])

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    nextCardRef.current = null

    fetchRandomCard(mode, lang)
      .then((card) => {
        setCurrentCard(card)
        setIsLoading(false)
        fetchNext()
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      })
  }, [mode, lang, fetchNext])

  const advance = useCallback(() => {
    if (nextCardRef.current) {
      setCurrentCard(nextCardRef.current)
      nextCardRef.current = null
      fetchNext()
    } else {
      setIsLoading(true)
      fetchRandomCard(mode, lang)
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
  }, [mode, lang, fetchNext])

  return { currentCard, isLoading, error, advance }
}
