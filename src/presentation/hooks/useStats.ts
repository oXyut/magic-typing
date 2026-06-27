import { useState, useRef, useCallback, useEffect } from 'react'

interface UseStatsResult {
  wpm: number
  accuracy: number
  elapsedSeconds: number
  recordKeystroke: (isCorrect: boolean) => void
  reset: () => void
}

export function useStats(isTyping: boolean): UseStatsResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [totalKeystrokes, setTotalKeystrokes] = useState(0)
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isTyping && startTimeRef.current !== null) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current!) / 1000))
      }, 500)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isTyping])

  const recordKeystroke = useCallback((isCorrect: boolean) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }
    setTotalKeystrokes((n) => n + 1)
    if (isCorrect) setCorrectKeystrokes((n) => n + 1)
  }, [])

  const wpm =
    elapsedSeconds > 0
      ? Math.round((correctKeystrokes / 5) / (elapsedSeconds / 60))
      : 0

  const accuracy =
    totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100

  const reset = useCallback(() => {
    startTimeRef.current = null
    setElapsedSeconds(0)
    setTotalKeystrokes(0)
    setCorrectKeystrokes(0)
  }, [])

  return { wpm, accuracy, elapsedSeconds, recordKeystroke, reset }
}
