import styles from './ResultScreen.module.css'
import type { FinalStats, GameConfig, RarityValue } from '../../domain/card'

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

const RARITY_LABELS: Record<RarityValue, string> = {
  common:   'コモン',
  uncommon: 'アンコモン',
  rare:     'レア',
  mythic:   '神話レア',
}

function getRarityLabel(rarities: RarityValue[]): string {
  if (rarities.length === 0) return 'すべてのレア度'
  return rarities.map(r => RARITY_LABELS[r]).join(' + ')
}

function getWpmGrade(wpm: number): { grade: string; color: string } {
  if (wpm >= 120) return { grade: 'S', color: '#e87c3e' }
  if (wpm >= 80)  return { grade: 'A', color: '#c9a74e' }
  if (wpm >= 50)  return { grade: 'B', color: '#7eb5d6' }
  if (wpm >= 30)  return { grade: 'C', color: '#4ade80' }
  return { grade: 'D', color: '#9e9e9e' }
}

export function ResultScreen({ stats, config, onRestart, onRetry }: Props) {
  const { wpm, accuracy, completedCards } = stats
  const { grade, color } = getWpmGrade(wpm)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.titleBlock}>
          <p className={styles.titleOrn}>◆ ◆ ◆</p>
          <h1 className={styles.title}>結果</h1>
        </div>

        <div className={styles.gradeBlock}>
          <span className={styles.grade} style={{ color }}>{grade}</span>
        </div>

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
          <span className={styles.dot}>◆</span>
          <span>{config.mode === 'name' ? 'カード名' : 'テキスト'}</span>
          <span className={styles.dot}>◆</span>
          <span>{FORMAT_LABELS[config.format]}</span>
          <span className={styles.dot}>◆</span>
          <span>{getRarityLabel(config.rarities)}</span>
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
