import { useId } from 'react'

export function UploadForm() {
  const uploadId = useId()
  return (
    <form>
      {/* <label htmlFor="file">Upload</label> */}
      <input type="file" id={uploadId} name="file" placeholder="Upload" />
    </form>
  )
}
