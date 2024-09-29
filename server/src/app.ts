import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import upload from './middleware/file'
import { generateJpegFromZippedGrid } from './utils'
import { GENERATED_IMAGES_PATH, UPLOAD_PATH } from './utils/constants'
const app = express()

app.use('/public', express.static(path.resolve('public')))
app.use(cors())

app.post('/upload', upload.array('file'), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[] | undefined

    if (!files || files.length === 0) {
      return res.status(400).send({ message: 'No files were uploaded.' })
    }

    Promise.allSettled(
      files.map((file) =>
        generateJpegFromZippedGrid(path.resolve(UPLOAD_PATH, file.filename))
      )
    ).then((resultArray) => {
      res.status(200).send({
        message: 'Files uploaded successfully!',
        files: files.map((file, index) => ({
          originalName: file.originalname,
          savedAs: file.filename,
          size: file.size,
          generatedImgPath:
            resultArray[index].status === 'fulfilled'
              ? resultArray[index].value
              : resultArray[index].reason,
        })),
      })
    })
  } catch (err) {
    res.status(500).send({
      message: 'Failed to upload files.',
      error: err instanceof Error ? err.message : err,
    })
  }
})

app.get('/files', (req, res) => {
  try {
    const baseDirectory = path.resolve(UPLOAD_PATH)
    const uploadedFileList = getAllFiles(baseDirectory)
    const relativeFileList = uploadedFileList.map((file) =>
      path.relative(baseDirectory, file)
    ) // Optional: Get file paths relative to base directory
    const timeStampLength = new Date().toISOString().length
    const fileInfo = relativeFileList.map((filename) => {
      return {
        originalName: filename.slice(timeStampLength + 1),
        savedAs: filename,
        size: fs.statSync(path.resolve(UPLOAD_PATH, filename)).size,
        generatedImgPath:
          GENERATED_IMAGES_PATH +
          path.basename(filename, path.extname(filename)) +
          '.jpeg',
      }
    })
    res.json(fileInfo)
  } catch (err) {
    res.status(500).json({ error: 'Unable to list files' })
  }
})

app.listen(5000, () => console.log('Server started on port 5000'))

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file)

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  })

  return arrayOfFiles
}
