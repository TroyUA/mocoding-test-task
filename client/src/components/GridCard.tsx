import styles from './GridCard.module.css'

export type GridCardProps = {
  originalName: string
  savedAs: string
  size: number
  generatedImgPath: string
}

function GridCard(props: GridCardProps) {
  return (
    <div className={styles.card}>
      <h2>{props.originalName}</h2>
      <p>Size: {props.size} bytes</p>
    </div>
  )
}

export default GridCard
