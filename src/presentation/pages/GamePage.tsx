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
    config.mode, config.lang, config.format
  )
  const target = currentCard?.typingTarget ?? ''
  const {
    typed, charStates, isComplete, inputRef,
    handleChange, handleCompositionStart, handleCompositionEnd, reset: resetTyping,
  } = useTyping(target, isPlaying)

  const {
    remainingSeconds, isTimeUp, wpm, accuracy, completedCards,
    recordKeystroke, recordCardCompleted, reset: resetStats,
  } = useStats(isPlaying, totalSeconds)

  // ゲーム終了
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
    recordCardCompleted(target.length)
    const timer = setTimeout(() => {
      advance()
      resetTyping()
    }, 400)
    return () => clearTimeout(timer)
  }, [isComplete, isPlaying, target.length, recordCardCompleted, advance, resetTyping])

  // カードロード後にフォーカス
  useEffect(() => {
    if (isPlaying && !isLoading) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isPlaying, isLoading, currentCard, inputRef])

  // キーストロークとuseTypingのhandleChangeを合成
  const prevTypedLenRef = useRef(0)
  prevTypedLenRef.current = typed.length

  const handleChangeWithStats = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    if (newVal.length > prevTypedLenRef.current) {
      const pos = newVal.length - 1
      recordKeystroke(newVal[pos] === target[pos])
    }
    handleChange(e)
  }, [handleChange, target, recordKeystroke])

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
                  typed={typed}
                  inputRef={inputRef}
                  handleChange={handleChangeWithStats}
                  handleCompositionStart={handleCompositionStart}
                  handleCompositionEnd={handleCompositionEnd}
                  isComplete={isComplete}
                />
                <div className={styles.bottomRow}>
                  <p className={styles.hint}>
                    {isLoading ? 'カードを読み込み中...' : 'クリックまたはキーを押してタイプ開始'}
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
