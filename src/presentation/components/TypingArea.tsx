import React from 'react'
import styles from './TypingArea.module.css'
import { CharSpan } from './CharSpan'
import type { CharEntry } from '../hooks/useTyping'

interface Props {
  charStates: CharEntry[]
  inputRef: React.RefObject<HTMLInputElement | null>
  handleCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => void
  handleInput: (e: React.FormEvent<HTMLInputElement>) => void
  isComplete: boolean
}

export function TypingArea({ charStates, inputRef, handleCompositionEnd, handleInput, isComplete }: Props) {
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
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        autoFocus
        aria-label="typing input"
      />
      {isComplete && (
        <div className={styles.completeMsg}>完了！次のカードへ...</div>
      )}
    </div>
  )
}
