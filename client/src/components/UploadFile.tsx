import { ChangeEvent, useId, useRef, useState } from 'react'
import styles from './UploadFile.module.css'
import { GridCardProps } from './GridCard'
import { WaterTemperatureMap } from './WaterTemperatureMap'
import UploadedGrids from './UploadedGrids'
import { SERVER_URL, UPLOAD_PATH } from '../constants'

export function UploadFile() {
  const [files, setFiles] = useState<FileList | null | undefined>(null)
  const [uploaded, setUploaded] = useState<GridCardProps[]>([])
  const uploadId = useId()
  const filePicker = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
  }

  const handleUpload = async () => {
    if (!files) {
      alert('Please select a file')
      return
    }

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('file', file) // 'files' is the field name multer will expect
    })

    try {
      const res = await fetch(`${SERVER_URL}${UPLOAD_PATH}`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = (await res.json()) as {
        message: string
        files: GridCardProps[]
      }
      setUploaded(data.files)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePick = () => {
    filePicker.current?.click()
  }

  return (
    <div className={styles.container}>
      <div>
        <input
          ref={filePicker}
          type="file"
          id={uploadId}
          name="file"
          className={styles.hidden}
          onChange={handleChange}
          accept=".zip"
          multiple
        />
        <button onClick={handlePick}>Pick file</button>
        <button onClick={handleUpload}>Upload now!</button>
      </div>

      <UploadedGrids grids={uploaded}></UploadedGrids>
      <WaterTemperatureMap
        imgUrl={
          uploaded.length > 0
            ? `${SERVER_URL}${uploaded[0].generatedImgPath}`
            : `${SERVER_URL}/public/images/empty-map.jpg`
        }
      />
      {/* )} */}
    </div>
  )
}
