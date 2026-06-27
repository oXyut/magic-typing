import { useState, useMemo, useRef, useCallback, RefObject, useEffect } from 'react'
import type { Language } from '../../domain/card'

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

export function useTyping(target: string, enabled: boolean, lang: Language): UseTypingResult {
  const [typed, setTyped] = useState('')
  // compositionstart は keydown より後に発火するため、ref で追跡
  const isComposingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const onCompositionStart = () => { isComposingRef.current = true }
    const onCompositionEnd = () => { isComposingRef.current = false }

    const handleKeyDown = (e: KeyboardEvent) => {
      // isComposing フラグまたは e.isComposing どちらかが true ならスキップ
      if (isComposingRef.current || e.isComposing) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {
        // JA モード: アルファベットキーは IME に任せる（直接追加しない）
        if (lang === 'ja' && /^[a-zA-Z]$/.test(e.key)) return
        setTyped((prev) => prev + e.key)
      }
    }

    window.addEventListener('compositionstart', onCompositionStart)
    window.addEventListener('compositionend', onCompositionEnd)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('compositionstart', onCompositionStart)
      window.removeEventListener('compositionend', onCompositionEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, lang])

  // 日本語 IME 用: input にフォーカスを維持
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

  // 日本語 IME 確定時: 確定テキストを typed に追記し input をクリア
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    const committed = e.currentTarget.value
    if (committed) {
      setTyped((prev) => prev + committed)
      e.currentTarget.value = ''
    }
  }, [])

  const reset = useCallback(() => {
    setTyped('')
    isComposingRef.current = false
    if (inputRef.current) inputRef.current.value = ''
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  return { typed, charStates, isComplete, inputRef, handleCompositionEnd, reset }
}
