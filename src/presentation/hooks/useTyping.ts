import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { playCorrect, playIncorrect } from '../../infrastructure/sounds'

export type CharState = 'pending' | 'correct' | 'incorrect' | 'cursor'

export interface CharEntry {
  char: string
  state: CharState
}

interface UseTypingResult {
  typed: string
  charStates: CharEntry[]
  isComplete: boolean
  inProgress: InProgressStats
  reset: () => void
  /** カード完了時に呼び出して累計キーストローク数と誤打数を取得する */
  getKeystrokeStats: () => { total: number; errors: number }
}

export interface InProgressStats {
  total: number
  errors: number
}

export function useTyping(
  target: string,
  enabled: boolean,
  soundEnabled: boolean,
): UseTypingResult {
  const [typed, setTyped] = useState('')
  const [inProgress, setInProgress] = useState<InProgressStats>({ total: 0, errors: 0 })
  const totalKsRef = useRef(0)   // 全キーストローク数（誤打含む）
  const errorKsRef = useRef(0)   // 誤打数

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      // Enter キーは改行文字として扱う（カードテキストの \n に対応）
      const char = e.key === 'Enter' ? '\n' : e.key

      if (char.length === 1) {
        setTyped((prev) => {
          if (prev === target) return prev  // 完了後はロック
          const isCorrect = target[prev.length] === char
          totalKsRef.current++
          if (!isCorrect) errorKsRef.current++
          setInProgress({ total: totalKsRef.current, errors: errorKsRef.current })
          if (soundEnabled) {
            if (isCorrect) playCorrect()
            else playIncorrect()
          }
          return prev + char
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, target, soundEnabled])

  const charStates = useMemo<CharEntry[]>(() =>
    target.split('').map((char, i) => {
      if (i > typed.length) return { char, state: 'pending' }
      if (i === typed.length) return { char, state: 'cursor' }
      return { char, state: typed[i] === char ? 'correct' : 'incorrect' }
    }),
    [target, typed],
  )

  const isComplete = typed.length > 0 && typed === target

  const getKeystrokeStats = useCallback(() => ({
    total: totalKsRef.current,
    errors: errorKsRef.current,
  }), [])

  const reset = useCallback(() => {
    setTyped('')
    totalKsRef.current = 0
    errorKsRef.current = 0
    setInProgress({ total: 0, errors: 0 })
  }, [])

  return { typed, charStates, isComplete, inProgress, reset, getKeystrokeStats }
}
