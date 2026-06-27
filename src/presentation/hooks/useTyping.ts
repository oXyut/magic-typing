import { useState, useMemo, useCallback, useEffect } from 'react'
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
  reset: () => void
}

export function useTyping(
  target: string,
  enabled: boolean,
  soundEnabled: boolean,
): UseTypingResult {
  const [typed, setTyped] = useState('')

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

      if (e.key.length === 1) {
        setTyped((prev) => {
          if (prev === target) return prev  // 完了後はロック
          if (soundEnabled) {
            if (target[prev.length] === e.key) playCorrect()
            else playIncorrect()
          }
          return prev + e.key
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

  const reset = useCallback(() => {
    setTyped('')
  }, [])

  return { typed, charStates, isComplete, reset }
}
