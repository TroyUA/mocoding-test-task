import { ChangeEvent, useId, useRef, useState } from 'react'
import styles from './UploadFile.module.css'

const HOST_URL = '/upload'

export function UploadFile() {
  const [files, setFiles] = useState<FileList | null | undefined>(null)
  const [uploaded, setUploaded] = useState<{
    fileName: string
    filePath: string
  }>()
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

      {files &&
        !uploaded &&
        Array.from(files).map((item, index) => (
          <ul key={index}>
            <li>Name: {item.name}</li>
            <li>Type: {item.type}</li>
            <li>Size: {item.size}</li>
            <li>LastModifiedDate: {item.lastModified.toLocaleString()}</li>
          </ul>
        ))}
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
