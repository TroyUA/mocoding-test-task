import { useEffect, useState } from 'react'
import GridCard from './components/GridCard'
import UploadedGrids from './components/UploadedGrids'
import { UploadFile } from './components/UploadFile'
import { WaterTemperatureMap } from './components/WaterTemperatureMap'
import { EMPTY_MAP_PATH, SERVER_URL } from './constants'
import styles from './App.module.css'
import { FileInfo } from './types'

function App() {
  const [uploaded, setUploaded] = useState<FileInfo[]>([])
  const [selectedImgPath, setSelectedImgPath] = useState(EMPTY_MAP_PATH)

  useEffect(() => {
    fetch(`${SERVER_URL}/files`)
      .then((response) => response.json())
      .then((data: FileInfo[]) => {
        setUploaded(data)
      })
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <UploadFile setUploaded={setUploaded} />
        <UploadedGrids>
          {uploaded.map((file) => (
            <GridCard
              key={file.savedAs}
              {...file}
              setSelectedImgPath={setSelectedImgPath}
              isSelected={selectedImgPath === file.generatedImgPath}
            />
          ))}
        </UploadedGrids>
      </div>
      <WaterTemperatureMap imgPath={selectedImgPath} />
    </div>
  )
}

export default App
