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
import { playCardComplete } from '../../infrastructure/sounds'
import type { GameConfig, FinalStats } from '../../domain/card'

type GameState = 'idle' | 'playing' | 'finished'

const FORMAT_LABELS: Record<string, string> = {
  all: 'ALL',
  standard: 'STD',
  pioneer: 'PIO',
  modern: 'MOD',
  legacy: 'LEG',
  vintage: 'VIN',
  pauper: 'PAU',
}

const DEFAULT_CONFIG: GameConfig = {
  mode: 'name',
  format: 'all',
  rarities: [],
  durationMinutes: 3,
  soundEnabled: true,
}

export function GamePage() {
  const [gameState, setGameState] = useState<GameState>('idle')
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG)
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null)
  const finishedRef = useRef(false)

  const isPlaying = gameState === 'playing'
  const totalSeconds = config.durationMinutes * 60

  const { currentCard, isLoading, error, advance } = useCardFetcher(
    config.mode, config.format, config.rarities,
  )
  const target = currentCard?.typingTarget ?? ''
  const { typed, charStates, isComplete, reset: resetTyping } =
    useTyping(target, isPlaying, config.soundEnabled)

  const { remainingSeconds, isTimeUp, wpm, accuracy, completedCards, recordCardCompleted, reset: resetStats } =
    useStats(isPlaying, totalSeconds)

  useEffect(() => {
    if (isTimeUp && !finishedRef.current) {
      finishedRef.current = true
      setFinalStats({ wpm, accuracy, completedCards })
      setGameState('finished')
    }
  }, [isTimeUp, wpm, accuracy, completedCards])

  useEffect(() => {
    if (!isPlaying || !isComplete) return
    const correctChars = charStates.filter((c) => c.state === 'correct').length
    recordCardCompleted(target.length, correctChars)
    if (config.soundEnabled) playCardComplete()
    const timer = setTimeout(() => {
      advance()
      resetTyping()
    }, 500)
    return () => clearTimeout(timer)
  }, [isComplete, isPlaying, charStates, target.length, recordCardCompleted, advance, resetTyping, config.soundEnabled])

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
        <header className={styles.topBar}>
          <span className={styles.topTitle}>MTG Typing</span>
          <div className={styles.topTags}>
            <span className={styles.tag}>{config.mode === 'name' ? 'Card Name' : 'Card Text'}</span>
            <span className={styles.tag}>{FORMAT_LABELS[config.format]}</span>
            {config.soundEnabled && <span className={styles.tag}>♪</span>}
          </div>
        </header>

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
                  isComplete={isComplete}
                />
                <div className={styles.bottomRow}>
                  <p className={styles.hint}>
                    {isLoading ? 'Loading card...' : `${typed.length} / ${target.length}`}
                  </p>
                  <button className={styles.skipBtn} onClick={handleSkip}>
                    Skip →
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
