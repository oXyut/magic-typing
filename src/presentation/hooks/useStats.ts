import { useState, useCallback, useEffect } from 'react'

interface UseStatsResult {
  remainingSeconds: number
  isTimeUp: boolean
  wpm: number
  accuracy: number
  completedCards: number
  recordCardCompleted: (charCount: number, correctChars: number) => void
  reset: () => void
}

export function useStats(active: boolean, totalSeconds: number): UseStatsResult {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [completedChars, setCompletedChars] = useState(0)
  const [completedCorrectChars, setCompletedCorrectChars] = useState(0)
  const [completedCards, setCompletedCards] = useState(0)

  useEffect(() => {
    setRemainingSeconds(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [active])

  const isTimeUp = active && remainingSeconds === 0

  const elapsedSeconds = totalSeconds - remainingSeconds
  const elapsedMinutes = elapsedSeconds / 60
  const wpm = elapsedMinutes > 0
    ? Math.round((completedChars / 5) / elapsedMinutes)
    : 0
  const accuracy = completedChars > 0
    ? Math.round((completedCorrectChars / completedChars) * 100)
    : 100

  const recordCardCompleted = useCallback((charCount: number, correctChars: number) => {
    setCompletedChars((n) => n + charCount)
    setCompletedCorrectChars((n) => n + correctChars)
    setCompletedCards((n) => n + 1)
  }, [])

  const reset = useCallback(() => {
    setRemainingSeconds(totalSeconds)
    setCompletedChars(0)
    setCompletedCorrectChars(0)
    setCompletedCards(0)
  }, [totalSeconds])

  return { remainingSeconds, isTimeUp, wpm, accuracy, completedCards, recordCardCompleted, reset }
}
