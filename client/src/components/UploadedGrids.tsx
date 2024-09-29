import styles from './UploadedGrids.module.css'

type UploadedGridsProps = {
  children: React.ReactNode
}
function UploadedGrids(props: UploadedGridsProps) {
  return (
    <div className={styles.container}>
      {props.children?.toString() === '' ? (
        <h2 style={{ alignSelf: 'center' }}>There is no uploaded grids yet</h2>
      ) : (
        <>
          <h2>Uploaded grids:</h2>
          <div className={styles.gridContainer}>{props.children}</div>
        </>
      )}
    </div>
  )
}

export default UploadedGrids
