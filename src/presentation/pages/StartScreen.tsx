import { useState, useRef, useEffect } from 'react'
import styles from './StartScreen.module.css'
import type { GameConfig, GameMode, Format, RarityValue, Card } from '../../domain/card'
import { parseDeckList } from '../../infrastructure/deckParser'
import { fetchCardsByNames } from '../../infrastructure/scryfallApi'

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

const DURATIONS = [1, 2, 3] as const

type DeckStatus = 'idle' | 'loading' | 'ready' | 'error'
type CardSource = 'random' | 'deck'

export function StartScreen({ defaultConfig, onStart }: Props) {
  const [mode, setMode] = useState<GameMode>(defaultConfig.mode)
  const [format, setFormat] = useState<Format>(defaultConfig.format)
  const [rarities, setRarities] = useState<RarityValue[]>(defaultConfig.rarities)
  const [durationMinutes, setDurationMinutes] = useState(defaultConfig.durationMinutes)
  const [soundEnabled, setSoundEnabled] = useState(defaultConfig.soundEnabled)

  const [cardSource, setCardSource] = useState<CardSource>(
    defaultConfig.deckPool && defaultConfig.deckPool.length > 0 ? 'deck' : 'random'
  )
  const [deckText, setDeckText] = useState('')
  const [deckStatus, setDeckStatus] = useState<DeckStatus>(
    defaultConfig.deckPool && defaultConfig.deckPool.length > 0 ? 'ready' : 'idle'
  )
  const [deckCards, setDeckCards] = useState<Card[]>(defaultConfig.deckPool ?? [])
  const [deckNotFound, setDeckNotFound] = useState<string[]>([])
  const [deckError, setDeckError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // mode が変わったらデッキプールをリセット（typingTarget の再取得が必要）
  useEffect(() => {
    if (deckStatus === 'ready') {
      setDeckStatus('idle')
      setDeckCards([])
      setDeckNotFound([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const toggleRarity = (value: RarityValue) => {
    setRarities(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setDeckText((ev.target?.result as string) ?? '')
      setDeckStatus('idle')
      setDeckCards([])
      setDeckNotFound([])
    }
    reader.readAsText(file, 'utf-8')
    // ファイル入力をリセット（同じファイルを再選択できるように）
    e.target.value = ''
  }

  const loadDeck = async () => {
    setDeckStatus('loading')
    setDeckError(null)
    try {
      const names = parseDeckList(deckText)
      if (names.length === 0) throw new Error('カード名が見つかりませんでした')
      const { cards, notFound } = await fetchCardsByNames(names, mode)
      if (cards.length === 0) throw new Error('有効なカードデータを取得できませんでした')
      setDeckCards(cards)
      setDeckNotFound(notFound)
      setDeckStatus('ready')
    } catch (err) {
      setDeckError(err instanceof Error ? err.message : 'エラーが発生しました')
      setDeckStatus('error')
    }
  }

  const canStart =
    cardSource === 'random' ||
    (cardSource === 'deck' && deckStatus === 'ready')

  const handleStart = () => {
    if (!canStart) return
    onStart({
      mode,
      format,
      rarities,
      durationMinutes,
      soundEnabled,
      deckPool: cardSource === 'deck' ? deckCards : undefined,
    })
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

          {/* タイピング対象 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />タイピング対象<span className={styles.sectionLine} />
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

          {/* カードソース */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />カードソース<span className={styles.sectionLine} />
            </h2>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.btn} ${cardSource === 'random' ? styles.btnActive : ''}`}
                onClick={() => setCardSource('random')}
              >
                ランダム
              </button>
              <button
                className={`${styles.btn} ${cardSource === 'deck' ? styles.btnActive : ''}`}
                onClick={() => setCardSource('deck')}
              >
                マイデッキ
              </button>
            </div>
          </section>

          {/* ランダムモード: カードプール + レア度 */}
          {cardSource === 'random' && (
            <>
              <div className={styles.divider} />

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionLine} />カードプール<span className={styles.sectionLine} />
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
                  <span className={styles.sectionLine} />レア度<span className={styles.sectionLine} />
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
            </>
          )}

          {/* デッキモード */}
          {cardSource === 'deck' && (
            <>
              <div className={styles.divider} />

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionLine} />デッキリスト<span className={styles.sectionLine} />
                </h2>

                <p className={styles.deckHelpText}>
                  Moxfield / MTG Arena / EDHREC などからエクスポートしたテキストを貼り付けるか、.txt ファイルをアップロードしてください。
                </p>

                <textarea
                  className={styles.deckTextarea}
                  value={deckText}
                  onChange={e => { setDeckText(e.target.value); setDeckStatus('idle') }}
                  placeholder={`4 Lightning Bolt\n4 Counterspell\n1 Black Lotus\n...`}
                  spellCheck={false}
                />

                <div className={styles.deckActions}>
                  <button
                    className={`${styles.btn} ${styles.btnSm}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    ファイルを選択
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <button
                    className={`${styles.btn} ${styles.btnSm} ${styles.btnLoad}`}
                    onClick={loadDeck}
                    disabled={deckStatus === 'loading' || !deckText.trim()}
                  >
                    {deckStatus === 'loading' ? (
                      <><span className={styles.spinner} /> 読み込み中...</>
                    ) : deckStatus === 'ready' ? '再読み込み' : '読み込む'}
                  </button>
                </div>

                {deckStatus === 'ready' && (
                  <div className={styles.deckResult}>
                    <p className={styles.deckResultOk}>
                      ✓ {deckCards.length} 枚のカードを読み込みました
                    </p>
                    {deckNotFound.length > 0 && (
                      <p className={styles.deckResultWarn}>
                        ⚠ 見つからなかったカード ({deckNotFound.length} 枚):{' '}
                        <span className={styles.deckNotFoundList}>
                          {deckNotFound.join(', ')}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {deckStatus === 'error' && (
                  <p className={styles.deckResultError}>✕ {deckError}</p>
                )}
              </section>
            </>
          )}

          <div className={styles.divider} />

          {/* 制限時間 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />制限時間<span className={styles.sectionLine} />
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

          <div className={styles.divider} />

          {/* サウンド */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />サウンド<span className={styles.sectionLine} />
            </h2>
            <div className={styles.toggleGroup}>
              <button
                className={`${styles.btn} ${soundEnabled ? styles.btnActive : ''}`}
                onClick={() => setSoundEnabled(true)}
              >
                ON
              </button>
              <button
                className={`${styles.btn} ${!soundEnabled ? styles.btnActive : ''}`}
                onClick={() => setSoundEnabled(false)}
              >
                OFF
              </button>
            </div>
          </section>

          <button
            className={styles.startBtn}
            onClick={handleStart}
            disabled={!canStart}
          >
            ゲームスタート
          </button>

        </div>
      </div>
    </div>
  )
}
