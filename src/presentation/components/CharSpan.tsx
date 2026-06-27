import styles from './CharSpan.module.css'
import type { CharState } from '../hooks/useTyping'

interface Props {
  char: string
  state: CharState
}

export function CharSpan({ char, state }: Props) {
  const display = char === ' ' ? ' ' : char === '\n' ? '↵\n' : char
  return <span className={styles[state]}>{display}</span>
}
