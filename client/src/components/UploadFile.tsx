import { ChangeEvent, useId, useRef, useState } from 'react'
import styles from './UploadFile.module.css'
import { SERVER_URL, UPLOAD_PATH } from '../constants'
import { classNames } from '../utils'
import { FileInfo, UploadResponse } from '../types'

type UploadFileProps = {
  setUploaded: React.Dispatch<React.SetStateAction<FileInfo[]>>
}
export function UploadFile({ setUploaded }: UploadFileProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(true)
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

    setIsUploading(true)

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('file', file) // 'files' is the field name multer will expect
    })

    try {
      const res = await fetch(`${SERVER_URL}/${UPLOAD_PATH}`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const { files: filesInfo } = (await res.json()) as UploadResponse
      setUploaded((prevData) => [...prevData, ...filesInfo])
      setFiles(null)
    } catch (error) {
      console.log(error)
    } finally {
      setIsUploading(false)
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
      <button
        className={styles.btn}
        onClick={handlePick}
        disabled={isUploading}
      >
        Pick zipped grid(s)
      </button>
      <button
        className={styles.btn}
        onClick={handleUpload}
        disabled={!files || isUploading}
      >
        Upload
      </button>
      <p className={classNames(!files && styles.hidden, styles.p)}>
        {!isUploading && `${files?.length} file(s) selected`}
      </p>
      {isUploading && (
        <div className={styles.fallback}>
          <span
            className={styles.loader}
            style={{ alignSelf: 'center', justifySelf: 'center' }}
          ></span>
        </div>
      )}
    </div>
  )
}
