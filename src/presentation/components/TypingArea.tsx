import React from 'react'
import styles from './TypingArea.module.css'
import { CharSpan } from './CharSpan'
import type { CharEntry } from '../hooks/useTyping'

interface Props {
  charStates: CharEntry[]
  typed: string
  inputRef: React.RefObject<HTMLInputElement | null>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleCompositionStart: () => void
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  isComplete: boolean
}

export function TypingArea({
  charStates,
  typed,
  inputRef,
  handleChange,
  handleCompositionStart,
  handleCompositionEnd,
  isComplete,
}: Props) {
  return (
    <div className={styles.wrapper} onClick={() => inputRef.current?.focus()}>
      <div className={`${styles.text} ${isComplete ? styles.complete : ''}`}>
        {charStates.map((entry, i) => (
          <CharSpan key={i} char={entry.char} state={entry.state} />
        ))}
      </div>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        className={styles.hiddenInput}
        value={typed}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="typing input"
      />
      {isComplete && (
        <div className={styles.completeMsg}>完了！次のカードを読み込み中...</div>
      )}
    </div>
  )
}
