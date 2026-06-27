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
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  reset: () => void
}

export function useTyping(target: string, enabled: boolean, lang: Language): UseTypingResult {
  const [typed, setTyped] = useState('')
  const isComposingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    const onCompositionStart = () => { isComposingRef.current = true }
    const onCompositionEnd   = () => { isComposingRef.current = false }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComposingRef.current || e.isComposing) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'Backspace') {
        e.preventDefault()
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      // JA モード: 文字キーはすべて onInput / compositionEnd に任せる
      if (lang === 'ja') return

      // EN モード: 1文字キーを直接追加
      if (e.key.length === 1) {
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

  // IME 確定: input の値をそのまま typed に追記してクリア
  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    const committed = e.currentTarget.value
    if (committed) {
      setTyped((prev) => prev + committed)
      e.currentTarget.value = ''
    }
  }, [])

  // JA モード専用: 句読点など IME を通さない直接入力を処理
  // EN モードは window.keydown が担うためここでは何もしない
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    if (lang !== 'ja') return
    const ie = e.nativeEvent as InputEvent
    if (ie.isComposing) return
    if (ie.inputType === 'insertFromComposition') return
    const data = ie.data
    if (data) {
      setTyped((prev) => prev + data)
      e.currentTarget.value = ''
    }
  }, [lang])

  const reset = useCallback(() => {
    setTyped('')
    isComposingRef.current = false
    if (inputRef.current) inputRef.current.value = ''
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  return { typed, charStates, isComplete, inputRef, handleCompositionEnd, handleInput, reset }
}
