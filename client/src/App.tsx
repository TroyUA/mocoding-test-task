import { useState } from 'react'
import GridCard from './components/GridCard'
import UploadedGrids from './components/UploadedGrids'
import { UploadFile } from './components/UploadFile'
import { WaterTemperatureMap } from './components/WaterTemperatureMap'
import { EMPTY_MAP_PATH } from './constants'
import styles from './App.module.css'
import { FileInfo } from './types'

function App() {
  const [uploaded, setUploaded] = useState<FileInfo[]>([])
  const [selectedImgPath, setSelectedImgPath] = useState(EMPTY_MAP_PATH)

  // useEffect(() => {
  //   const images: GridCardProps[] = []
  //   fetch(`${SERVER_URL}/files`)
  //     .then((response) => response.json())
  //     .then((data: string[]) =>
  //       data.map((item) => {
  //         const card: GridCardProps={
  //           generatedImgPath:item,

  //         }
  //         console.log(item)
  //       })
  //     )
  // }, [])

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <UploadFile setUploaded={setUploaded} />
        <UploadedGrids>
          {uploaded.map((grid) => (
            <GridCard
              key={grid.savedAs}
              {...grid}
              setSelectedImgPath={setSelectedImgPath}
              isSelected={selectedImgPath === grid.generatedImgPath}
            />
          ))}
        </UploadedGrids>
      </div>
      <WaterTemperatureMap imgPath={selectedImgPath} />
    </div>
  )
}

export default App
