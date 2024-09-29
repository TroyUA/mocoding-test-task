export type UploadResponse = {
  message: string
  files: FileInfo[]
}

export type FileInfo = {
  originalName: string
  savedAs: string
  size: number
  generatedImgPath: string
}
