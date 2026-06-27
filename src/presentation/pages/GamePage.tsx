import { useState, useEffect, useCallback } from 'react'
import styles from './GamePage.module.css'
import { Header } from '../components/Header'
import { CardDisplay } from '../components/CardDisplay'
import { TypingArea } from '../components/TypingArea'
import { StatsBar } from '../components/StatsBar'
import { useCardFetcher } from '../hooks/useCardFetcher'
import { useTyping } from '../hooks/useTyping'
import { useStats } from '../hooks/useStats'
import type { GameMode, Language } from '../../domain/card'

export function GamePage() {
  const [mode, setMode] = useState<GameMode>('name')
  const [lang, setLang] = useState<Language>('en')

  const { currentCard, isLoading, error, advance } = useCardFetcher(mode, lang)
  const target = currentCard?.typingTarget ?? ''
  const { typed, charStates, isComplete, inputRef, handleChange, handleCompositionStart, handleCompositionEnd, reset } = useTyping(target)
  const isTyping = typed.length > 0 && !isComplete
  const { wpm, accuracy, elapsedSeconds, recordKeystroke, reset: resetStats } = useStats(isTyping)

  const handleModeChange = useCallback((m: GameMode) => {
    setMode(m)
    reset()
    resetStats()
  }, [reset, resetStats])

  const handleLangChange = useCallback((l: Language) => {
    setLang(l)
    reset()
    resetStats()
  }, [reset, resetStats])

  const handleSkip = useCallback(() => {
    advance()
    reset()
    resetStats()
  }, [advance, reset, resetStats])

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        advance()
        reset()
        resetStats()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isComplete, advance, reset, resetStats])

  useEffect(() => {
    if (!isLoading && !isComplete) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isLoading, currentCard, isComplete, inputRef])

  const prevTypedLength = typed.length
  const handleChangeWithStats = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    if (newVal.length > prevTypedLength) {
      const pos = newVal.length - 1
      const isCorrect = newVal[pos] === target[pos]
      recordKeystroke(isCorrect)
    }
    handleChange(e)
  }, [handleChange, prevTypedLength, target, recordKeystroke])

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Header mode={mode} lang={lang} onModeChange={handleModeChange} onLangChange={handleLangChange} />
        <StatsBar wpm={wpm} accuracy={accuracy} elapsedSeconds={elapsedSeconds} />
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
                <button className={styles.skipBtn} onClick={handleSkip}>
                  スキップ →
                </button>
                <p className={styles.hint}>
                  {isLoading ? 'カードを読み込み中...' : 'クリックしてタイプ開始'}
                </p>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
