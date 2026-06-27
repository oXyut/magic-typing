import styles from './StatsBar.module.css'

interface Props {
  wpm: number
  accuracy: number
  elapsedSeconds: number
}

export function StatsBar({ wpm, accuracy, elapsedSeconds }: Props) {
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <span className={styles.value}>{wpm}</span>
        <span className={styles.label}>WPM</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.value}>{accuracy}%</span>
        <span className={styles.label}>正確率</span>
      </div>
      <div className={styles.divider} />
      <div className={styles.stat}>
        <span className={styles.value}>{timeStr}</span>
        <span className={styles.label}>経過時間</span>
      </div>
    </div>
  )
}
