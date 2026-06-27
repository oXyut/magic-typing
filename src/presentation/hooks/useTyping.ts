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
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCompositionStart: () => void
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  reset: () => void
}

export function useTyping(target: string, enabled: boolean): UseTypingResult {
  const [typed, setTyped] = useState('')
  const isComposing = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // グローバルキーダウンでinputへフォーカスを戻す
  useEffect(() => {
    if (!enabled) return
    const refocus = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'F5' || e.metaKey || e.ctrlKey) return
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', refocus)
    return () => window.removeEventListener('keydown', refocus)
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing.current) return
    setTyped(e.target.value)
  }, [])

  const handleCompositionStart = useCallback(() => {
    isComposing.current = true
  }, [])

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false
    setTyped(e.currentTarget.value)
  }, [])

  const reset = useCallback(() => {
    setTyped('')
    isComposing.current = false
    // inputのDOM値もリセット
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  return {
    typed,
    charStates,
    isComplete,
    inputRef,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    reset,
  }
}
