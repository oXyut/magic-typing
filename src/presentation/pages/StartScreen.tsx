import { useState } from 'react'
import styles from './StartScreen.module.css'
import type { GameConfig, GameMode, Language, Format, Rarity } from '../../domain/card'

interface Props {
  defaultConfig: GameConfig
  onStart: (config: GameConfig) => void
}

const FORMATS: { value: Format; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'standard', label: 'スタンダード' },
  { value: 'pioneer', label: 'パイオニア' },
  { value: 'modern', label: 'モダン' },
  { value: 'legacy', label: 'レガシー' },
  { value: 'vintage', label: 'ヴィンテージ' },
  { value: 'pauper', label: 'パウパー' },
]

const RARITIES: { value: Rarity; label: string; color: string }[] = [
  { value: 'all',      label: 'すべて',    color: 'var(--color-text-muted)' },
  { value: 'common',   label: 'コモン',    color: '#c0c0c0' },
  { value: 'uncommon', label: 'アンコモン', color: '#8ab4d4' },
  { value: 'rare',     label: 'レア',      color: '#c9a74e' },
  { value: 'mythic',   label: '神話レア',  color: '#e87c3e' },
]

const DURATIONS = [1, 3, 5, 10] as const

export function StartScreen({ defaultConfig, onStart }: Props) {
  const [mode, setMode] = useState<GameMode>(defaultConfig.mode)
  const [lang, setLang] = useState<Language>(defaultConfig.lang)
  const [format, setFormat] = useState<Format>(defaultConfig.format)
  const [rarity, setRarity] = useState<Rarity>(defaultConfig.rarity)
  const [durationMinutes, setDurationMinutes] = useState(defaultConfig.durationMinutes)

  const handleStart = () => {
    onStart({ mode, lang, format, rarity, durationMinutes })
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>MTG Typing</h1>
          <p className={styles.sub}>Magic: The Gathering カードタイピングゲーム</p>
        </div>

        <div className={styles.card}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>タイピング対象</h2>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${mode === 'name' ? styles.active : ''}`}
                onClick={() => setMode('name')}
              >
                カード名
              </button>
              <button
                className={`${styles.toggleBtn} ${mode === 'text' ? styles.active : ''}`}
                onClick={() => setMode('text')}
              >
                カードテキスト
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>言語</h2>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${lang === 'en' ? styles.active : ''}`}
                onClick={() => setLang('en')}
              >
                英語 (EN)
              </button>
              <button
                className={`${styles.toggleBtn} ${lang === 'ja' ? styles.active : ''}`}
                onClick={() => setLang('ja')}
              >
                日本語 (JA)
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>カードプール</h2>
            <div className={styles.formatGrid}>
              {FORMATS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.formatBtn} ${format === value ? styles.active : ''}`}
                  onClick={() => setFormat(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>レア度</h2>
            <div className={styles.toggleGroup}>
              {RARITIES.map(({ value, label, color }) => (
                <button
                  key={value}
                  className={`${styles.toggleBtn} ${rarity === value ? styles.active : ''}`}
                  style={rarity === value ? {} : { '--rarity-color': color } as React.CSSProperties}
                  onClick={() => setRarity(value)}
                  data-rarity={value}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>制限時間</h2>
            <div className={styles.toggleGroup}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  className={`${styles.toggleBtn} ${durationMinutes === d ? styles.active : ''}`}
                  onClick={() => setDurationMinutes(d)}
                >
                  {d}分
                </button>
              ))}
            </div>
          </section>

          <button className={styles.startBtn} onClick={handleStart}>
            ゲームスタート
          </button>
        </div>
      </div>
    </div>
  )
}
