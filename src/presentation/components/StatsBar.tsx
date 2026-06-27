import styles from './StatsBar.module.css'

interface Props {
  wpm: number
  accuracy: number
  remainingSeconds: number
  totalSeconds: number
}

export function StatsBar({ wpm, accuracy, remainingSeconds, totalSeconds }: Props) {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const pct = totalSeconds > 0 ? remainingSeconds / totalSeconds : 1
  const urgent = remainingSeconds <= 10 && remainingSeconds > 0

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <span className={styles.value}>{wpm}</span>
        <span className={styles.label}>WPM</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.value}>{accuracy}%</span>
        <span className={styles.label}>正確率</span>
      </div>
      <div className={`${styles.stat} ${styles.timerStat} ${urgent ? styles.urgent : ''}`}>
        <span className={styles.value}>{timeStr}</span>
        <span className={styles.label}>残り時間</span>
        <div className={styles.timerTrack}>
          <div className={styles.timerFill} style={{ width: `${pct * 100}%` }} />
        </div>
      </div>
    </div>
  )
}
