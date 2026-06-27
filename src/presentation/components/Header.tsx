import styles from './Header.module.css'
import type { GameMode, Language } from '../../domain/card'

interface Props {
  mode: GameMode
  lang: Language
  onModeChange: (m: GameMode) => void
  onLangChange: (l: Language) => void
}

export function Header({ mode, lang, onModeChange, onLangChange }: Props) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>MTG Typing</h1>
      <div className={styles.controls}>
        <div className={styles.toggle}>
          <button
            className={`${styles.btn} ${mode === 'name' ? styles.active : ''}`}
            onClick={() => onModeChange('name')}
          >
            カード名
          </button>
          <button
            className={`${styles.btn} ${mode === 'text' ? styles.active : ''}`}
            onClick={() => onModeChange('text')}
          >
            テキスト
          </button>
        </div>
        <div className={styles.toggle}>
          <button
            className={`${styles.btn} ${lang === 'en' ? styles.active : ''}`}
            onClick={() => onLangChange('en')}
          >
            EN
          </button>
          <button
            className={`${styles.btn} ${lang === 'ja' ? styles.active : ''}`}
            onClick={() => onLangChange('ja')}
          >
            JA
          </button>
        </div>
      </div>
    </header>
  )
}
