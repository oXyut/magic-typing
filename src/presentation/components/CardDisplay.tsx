import { useState } from 'react'
import styles from './CardDisplay.module.css'

interface Props {
  imageUrl: string
  displayName: string
  isLoading: boolean
}

export function CardDisplay({ imageUrl, displayName, isLoading }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false)

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeleton} />
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.name}>{displayName}</p>
      <div className={styles.imgWrapper}>
        {!imgLoaded && <div className={styles.skeleton} />}
        <img
          src={imageUrl}
          alt={displayName}
          className={`${styles.img} ${imgLoaded ? styles.visible : styles.hidden}`}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
        />
      </div>
    </div>
  )
}
