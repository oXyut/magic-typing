import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './GamePage.module.css'
import { StartScreen } from './StartScreen'
import { ResultScreen } from './ResultScreen'
import { CardDisplay } from '../components/CardDisplay'
import { TypingArea } from '../components/TypingArea'
import { StatsBar } from '../components/StatsBar'
import { useCardFetcher } from '../hooks/useCardFetcher'
import { useTyping } from '../hooks/useTyping'
import { useStats } from '../hooks/useStats'
import type { GameConfig, FinalStats } from '../../domain/card'

type GameState = 'idle' | 'playing' | 'finished'

const FORMAT_LABELS: Record<string, string> = {
  all: 'すべて',
  standard: 'スタンダード',
  pioneer: 'パイオニア',
  modern: 'モダン',
  legacy: 'レガシー',
  vintage: 'ヴィンテージ',
  pauper: 'パウパー',
}

const DEFAULT_CONFIG: GameConfig = {
  mode: 'name',
  lang: 'en',
  format: 'all',
  rarity: 'all',
  durationMinutes: 3,
}

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG)
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null)
  const finishedRef = useRef(false)

  const isPlaying = gameState === 'playing'
  const totalSeconds = config.durationMinutes * 60

  const { currentCard, isLoading, error, advance } = useCardFetcher(
    config.mode, config.lang, config.format, config.rarity,
  )
  const target = currentCard?.typingTarget ?? ''
  const { typed, charStates, isComplete, inputRef, handleCompositionEnd, handleInput, reset: resetTyping } =
    useTyping(target, isPlaying, config.lang)

  const { remainingSeconds, isTimeUp, wpm, accuracy, completedCards, recordCardCompleted, reset: resetStats } =
    useStats(isPlaying, totalSeconds)

  // 時間切れ → 終了
  useEffect(() => {
    if (isTimeUp && !finishedRef.current) {
      finishedRef.current = true
      setFinalStats({ wpm, accuracy, completedCards })
      setGameState('finished')
    }
  }, [isTimeUp, wpm, accuracy, completedCards])

  // カード完了 → 次へ
  useEffect(() => {
    if (!isPlaying || !isComplete) return
    const correctChars = charStates.filter((c) => c.state === 'correct').length
    recordCardCompleted(target.length, correctChars)
    const timer = setTimeout(() => {
      advance()
      resetTyping()
    }, 400)
    return () => clearTimeout(timer)
  }, [isComplete, isPlaying, charStates, target.length, recordCardCompleted, advance, resetTyping])

  const handleStart = useCallback((cfg: GameConfig) => {
    finishedRef.current = false
    setConfig(cfg)
    resetStats()
    resetTyping()
    setGameState('playing')
  }, [resetStats, resetTyping])

  const handleRestart = useCallback(() => {
    setGameState('idle')
  }, [])

  const handleRetry = useCallback(() => {
    finishedRef.current = false
    resetStats()
    resetTyping()
    advance()
    setGameState('playing')
  }, [resetStats, resetTyping, advance])

  const handleSkip = useCallback(() => {
    advance()
    resetTyping()
  }, [advance, resetTyping])

  if (gameState === 'idle') {
    return <StartScreen defaultConfig={config} onStart={handleStart} />
  }

  if (gameState === 'finished' && finalStats) {
    return (
      <ResultScreen
        stats={finalStats}
        config={config}
        onRestart={handleRestart}
        onRetry={handleRetry}
      />
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <span className={styles.topTitle}>MTG Typing</span>
          <div className={styles.topTags}>
            <span className={styles.tag}>{config.mode === 'name' ? 'カード名' : 'テキスト'}</span>
            <span className={styles.tag}>{config.lang === 'en' ? 'EN' : 'JA'}</span>
            <span className={styles.tag}>{FORMAT_LABELS[config.format]}</span>
          </div>
        </div>
        <StatsBar
          wpm={wpm}
          accuracy={accuracy}
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
        />
        <main className={styles.main}>
          <aside className={styles.cardSide}>
            <CardDisplay
              imageUrl={currentCard?.imageUrl ?? ''}
              displayName={currentCard?.displayName ?? ''}
              isLoading={isLoading}
            />
          </aside>
          <section className={styles.typingSide}>
            {error ? (
              <div className={styles.error}>
                <p>カードの取得に失敗しました</p>
                <p className={styles.errorDetail}>{error}</p>
                <button className={styles.retryBtn} onClick={handleSkip}>再試行</button>
              </div>
            ) : (
              <>
                <TypingArea
                  charStates={charStates}
                  inputRef={inputRef}
                  handleCompositionEnd={handleCompositionEnd}
                  handleInput={handleInput}
                  isComplete={isComplete}
                />
                <div className={styles.bottomRow}>
                  <p className={styles.hint}>
                    {isLoading ? 'カードを読み込み中...' : `${typed.length} / ${target.length} 文字`}
                  </p>
                  <button className={styles.skipBtn} onClick={handleSkip}>
                    スキップ →
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
