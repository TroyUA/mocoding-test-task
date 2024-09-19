import { classNames } from '../utils'
import styles from './GridCard.module.css'

export type GridCardProps = {
  originalName: string
  savedAs: string
  size: number
  generatedImgPath: string
  setSelectedImgPath: React.Dispatch<React.SetStateAction<string>>
  isSelected: boolean
}

function GridCard({
  setSelectedImgPath,
  generatedImgPath,
  isSelected,
  originalName,
  size,
  savedAs,
}: GridCardProps) {
  return (
    <button
      tabIndex={0}
      className={classNames(styles.card, isSelected && styles.selected)}
      onFocus={() => setSelectedImgPath(generatedImgPath)}
    >
      <h2>{originalName}</h2>
      <p className={styles.savedAs}>
        Saved as: <br /> {savedAs}
      </p>
      <p>Size: {size} bytes</p>
    </button>
  )
}

export default GridCard
