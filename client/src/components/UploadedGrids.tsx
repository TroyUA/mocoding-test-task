import GridCard, { GridCardProps } from './GridCard'
import styles from './UploadedGrids.module.css'

type UploadedGridsProps = {
  grids: GridCardProps[]
}
function UploadedGrids(props: UploadedGridsProps) {
  return (
    <div className={styles.container}>
      {props.grids.map((grid) => (
        <GridCard {...grid} />
      ))}
    </div>
  )
}

export default UploadedGrids
