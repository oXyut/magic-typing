import { useState } from 'react'
import styles from './StartScreen.module.css'
import type { GameConfig, GameMode, Language, Format, RarityValue } from '../../domain/card'

interface Props {
  defaultConfig: GameConfig
  onStart: (config: GameConfig) => void
}

const FORMATS: { value: Format; label: string }[] = [
  { value: 'all',      label: 'すべて' },
  { value: 'standard', label: 'スタンダード' },
  { value: 'pioneer',  label: 'パイオニア' },
  { value: 'modern',   label: 'モダン' },
  { value: 'legacy',   label: 'レガシー' },
  { value: 'vintage',  label: 'ヴィンテージ' },
  { value: 'pauper',   label: 'パウパー' },
]

const RARITIES: { value: RarityValue; label: string; cssVar: string }[] = [
  { value: 'common',   label: 'コモン',    cssVar: 'var(--color-common)' },
  { value: 'uncommon', label: 'アンコモン', cssVar: 'var(--color-uncommon)' },
  { value: 'rare',     label: 'レア',      cssVar: 'var(--color-rare)' },
  { value: 'mythic',   label: '神話レア',  cssVar: 'var(--color-mythic)' },
]

const DURATIONS = [1, 3, 5, 10] as const

export function StartScreen({ defaultConfig, onStart }: Props) {
  const [mode, setMode] = useState<GameMode>(defaultConfig.mode)
  const [lang, setLang] = useState<Language>(defaultConfig.lang)
  const [format, setFormat] = useState<Format>(defaultConfig.format)
  const [rarities, setRarities] = useState<RarityValue[]>(defaultConfig.rarities)
  const [durationMinutes, setDurationMinutes] = useState(defaultConfig.durationMinutes)

  const toggleRarity = (value: RarityValue) => {
    setRarities(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    )
  }

  const handleStart = () => {
    onStart({ mode, lang, format, rarities, durationMinutes })
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.titleBlock}>
          <p className={styles.titleOrn}>◆ ◆ ◆</p>
          <h1 className={styles.title}>MTG Typing</h1>
          <p className={styles.sub}>Magic: The Gathering カードタイピングゲーム</p>
        </div>

        <div className={styles.panel}>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              タイピング対象
              <span className={styles.sectionLine} />
            </h2>
            <div className={styles.toggleGroup}>
              {([
                { value: 'name' as GameMode, label: 'カード名' },
                { value: 'text' as GameMode, label: 'カードテキスト' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.btn} ${mode === value ? styles.btnActive : ''}`}
                  onClick={() => setMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              言語
              <span className={styles.sectionLine} />
            </h2>
            <div className={styles.toggleGroup}>
              {([
                { value: 'en' as Language, label: '英語 (EN)' },
                { value: 'ja' as Language, label: '日本語 (JA)' },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.btn} ${lang === value ? styles.btnActive : ''}`}
                  onClick={() => setLang(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              カードプール
              <span className={styles.sectionLine} />
            </h2>
            <div className={styles.formatGrid}>
              {FORMATS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.btn} ${styles.btnSm} ${format === value ? styles.btnActive : ''}`}
                  onClick={() => setFormat(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              レア度
              <span className={styles.sectionLine} />
            </h2>
            <div className={styles.rarityGroup}>
              <button
                className={`${styles.btn} ${rarities.length === 0 ? styles.btnActive : ''}`}
                onClick={() => setRarities([])}
              >
                すべて
              </button>
              {RARITIES.map(({ value, label, cssVar }) => (
                <button
                  key={value}
                  className={`${styles.rarityBtn} ${rarities.includes(value) ? styles.rarityBtnActive : ''}`}
                  style={{ '--rarity-c': cssVar } as React.CSSProperties}
                  onClick={() => toggleRarity(value)}
                  data-rarity={value}
                >
                  <span className={styles.rarityGem}>◆</span>
                  {label}
                </button>
              ))}
            </div>
            {rarities.length > 0 && (
              <p className={styles.rarityHint}>
                {rarities.map(r => RARITIES.find(x => x.value === r)?.label).join(' + ')} を選択中
              </p>
            )}
          </section>

          <div className={styles.divider} />

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              制限時間
              <span className={styles.sectionLine} />
            </h2>
            <div className={styles.toggleGroup}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  className={`${styles.btn} ${durationMinutes === d ? styles.btnActive : ''}`}
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
