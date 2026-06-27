import { useState, useCallback, useEffect } from 'react'

interface UseStatsResult {
  remainingSeconds: number
  isTimeUp: boolean
  wpm: number
  accuracy: number
  completedCards: number
  recordKeystroke: (isCorrect: boolean) => void
  recordCardCompleted: (charCount: number) => void
  reset: () => void
}

export function useStats(active: boolean, totalSeconds: number): UseStatsResult {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const [completedChars, setCompletedChars] = useState(0)
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
  const accuracy = totalKeystrokes > 0
    ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
    : 100

  const recordKeystroke = useCallback((isCorrect: boolean) => {
    setTotalKeystrokes((n) => n + 1)
    if (isCorrect) setCorrectKeystrokes((n) => n + 1)
  }, [])

  const recordCardCompleted = useCallback((charCount: number) => {
    setCompletedChars((n) => n + charCount)
    setCompletedCards((n) => n + 1)
  }, [])

  const reset = useCallback(() => {
    setRemainingSeconds(totalSeconds)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
    setCompletedChars(0)
    setCompletedCards(0)
  }, [totalSeconds])

  return { remainingSeconds, isTimeUp, wpm, accuracy, completedCards, recordKeystroke, recordCardCompleted, reset }
}
