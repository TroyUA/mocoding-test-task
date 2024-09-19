import styles from './UploadedGrids.module.css'

type UploadedGridsProps = {
  children: React.ReactNode
}
function UploadedGrids(props: UploadedGridsProps) {
  return (
    <div className={styles.container}>
      <h2>Uploaded grids:</h2>
      <div className={styles.gridContainer}>{props.children}</div>
    </div>
  )
}

export default UploadedGrids
