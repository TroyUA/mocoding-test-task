const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const upload = require('./middleware/file')
const { generateJpegFromZippedGrid } = require('./utils')
const app = express()

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(cors())

app.post('/upload', upload.array('file'), (req, res) => {
  try {
    const files = req.files

    if (!files || files.length === 0) {
      return res.status(400).send({ message: 'No files were uploaded.' })
    }

    Promise.allSettled(
      files.map((file) =>
        generateJpegFromZippedGrid(
          path.join(`${__dirname}/uploads`, file.filename)
        )
      )
    ).then((resultArray) => {
      res.status(200).send({
        message: 'Files uploaded successfully!',
        files: files.map((file, index) => ({
          originalName: file.originalname,
          savedAs: file.filename,
          size: file.size,
          generatedImgPath: resultArray[index]?.value,
        })),
      })
    })
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Failed to upload files.', error: err.message })
  }
})

app.get('/files', (req, res) => {
  try {
    const baseDirectory = path.join(__dirname, 'public/')
    const fileList = getAllFiles(baseDirectory)
    const relativeFileList = fileList.map((file) =>
      path.relative(baseDirectory, file)
    ) // Optional: Get file paths relative to base directory
    res.json(relativeFileList)
  } catch (err) {
    res.status(500).json({ error: 'Unable to list files' })
  }
})

app.listen(5000, () => console.log('Server started on port 5000'))

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

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
