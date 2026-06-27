import styles from './ResultScreen.module.css'
import type { FinalStats, GameConfig } from '../../domain/card'

interface Props {
  stats: FinalStats
  config: GameConfig
  onRestart: () => void
  onRetry: () => void
}

const FORMAT_LABELS: Record<string, string> = {
  all: 'すべて',
  standard: 'スタンダード',
  pioneer: 'パイオニア',
  modern: 'モダン',
  legacy: 'レガシー',
  vintage: 'ヴィンテージ',
  pauper: 'パウパー',
}

const RARITY_LABELS: Record<string, string> = {
  all: 'すべてのレア度',
  common: 'コモン',
  uncommon: 'アンコモン',
  rare: 'レア',
  mythic: '神話レア',
}

export function ResultScreen({ stats, config, onRestart, onRetry }: Props) {
  const { wpm, accuracy, completedCards } = stats

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>結果</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{wpm}</span>
            <span className={styles.statLabel}>WPM</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{accuracy}%</span>
            <span className={styles.statLabel}>正確率</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{completedCards}</span>
            <span className={styles.statLabel}>完了カード数</span>
          </div>
        </div>

        <div className={styles.configSummary}>
          <span>{config.durationMinutes}分</span>
          <span>·</span>
          <span>{config.mode === 'name' ? 'カード名' : 'テキスト'}</span>
          <span>·</span>
          <span>{config.lang === 'en' ? '英語' : '日本語'}</span>
          <span>·</span>
          <span>{FORMAT_LABELS[config.format]}</span>
          <span>·</span>
          <span>{RARITY_LABELS[config.rarity]}</span>
        </div>

        <div className={styles.buttons}>
          <button className={styles.retryBtn} onClick={onRetry}>
            同じ設定でもう一度
          </button>
          <button className={styles.restartBtn} onClick={onRestart}>
            設定を変更する
          </button>
        </div>
      </div>
    </div>
  )
}
