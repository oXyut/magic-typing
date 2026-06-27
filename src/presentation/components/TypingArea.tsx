import styles from './TypingArea.module.css'
import { CharSpan } from './CharSpan'
import type { CharEntry } from '../hooks/useTyping'

interface Props {
  charStates: CharEntry[]
  isComplete: boolean
}

export function TypingArea({ charStates, isComplete }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.text} ${isComplete ? styles.complete : ''}`}>
        {charStates.map((entry, i) => (
          <CharSpan key={i} char={entry.char} state={entry.state} />
        ))}
      </div>
      {isComplete && (
        <div className={styles.completeMsg}>完了！次のカードへ...</div>
      )}
    </div>
  )
}
