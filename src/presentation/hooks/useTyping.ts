import { useState, useMemo, useRef, useCallback, RefObject, useEffect } from 'react'

export type CharState = 'pending' | 'correct' | 'incorrect' | 'cursor'

export interface CharEntry {
  char: string
  state: CharState
}

interface UseTypingResult {
  typed: string
  charStates: CharEntry[]
  isComplete: boolean
  inputRef: RefObject<HTMLInputElement | null>
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  reset: () => void
}

export function useTyping(target: string, enabled: boolean): UseTypingResult {
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // 英語: window keydown で直接 typed を更新（フォーカス不要）
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // IME変換中はcompositionEndに任せる
      if (e.isComposing) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }
      if (e.key.length === 1) {
        setTyped((prev) => prev + e.key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled])

  // 日本語: inputへのフォーカス確保
  useEffect(() => {
    if (!enabled) return
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [enabled])

  const charStates = useMemo<CharEntry[]>(() =>
    target.split('').map((char, i) => {
      if (i > typed.length) return { char, state: 'pending' }
      if (i === typed.length) return { char, state: 'cursor' }
      return { char, state: typed[i] === char ? 'correct' : 'incorrect' }
    }),
    [target, typed],
  )

  const isComplete = typed.length > 0 && typed === target

  // 日本語IME: 確定時にtypedへ追記、inputをクリア
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    const committed = e.currentTarget.value
    if (committed) {
      setTyped((prev) => prev + committed)
      e.currentTarget.value = ''
    }
  }, [])

  const reset = useCallback(() => {
    setTyped('')
    if (inputRef.current) inputRef.current.value = ''
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  return { typed, charStates, isComplete, inputRef, handleCompositionEnd, reset }
}
