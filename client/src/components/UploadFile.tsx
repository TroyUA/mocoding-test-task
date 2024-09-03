import { ChangeEvent, useId, useRef, useState } from 'react'
import styles from './UploadFile.module.css'

const HOST_URL = '/upload'

export function UploadFile() {
  const [selectedFile, setSelectedFile] = useState<File | null | undefined>(
    null
  )
  const [uploaded, setUploaded] = useState<{
    fileName: string
    filePath: string
  }>()
  const uploadId = useId()
  const filePicker = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files)
    setSelectedFile(e.target.files?.[0])
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch(`http://localhost:5000${HOST_URL}`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      setUploaded(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handlePick = () => {
    filePicker.current?.click()
  }
  return (
    <div className={styles.container}>
      <button onClick={handlePick}>Pick file</button>
      <input
        ref={filePicker}
        type="file"
        id={uploadId}
        name="file"
        className={styles.hidden}
        onChange={handleChange}
      />

      <button onClick={handleUpload}>Upload now!</button>

      {selectedFile && (
        <ul>
          <li>Name: {selectedFile.name}</li>
          <li>Type: {selectedFile.type}</li>
          <li>Size: {selectedFile.size}</li>
          <li>
            LastModifiedDate: {selectedFile.lastModified.toLocaleString()}
          </li>
        </ul>
      )}
      {uploaded && (
        <div>
          <h2>{uploaded.fileName}</h2>
          <img
            className={styles.image}
            alt="uploaded"
            src={`http://localhost:5000${uploaded.filePath}`}
          />
        </div>
      )}
    </div>
  )
}
