const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const { extractFile, processImage } = require('./utils')
const upload = require('./middleware/file')
const app = express()

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(cors())

app.post('/upload', upload.array('file'), (req, res) => {
  try {
    const files = req.files // Array of files

    if (!files || files.length === 0) {
      return res.status(400).send({ message: 'No file were uploaded.' })
    }

    res.status(200).send({
      message: 'Files uploaded successfully!',
      files: files.map((file) => ({
        originalName: file.originalname,
        savedAs: file.filename,
        size: file.size,
      })),
    })
  } catch (err) {
    res
      .status(500)
      .send({ message: 'Failed to upload files.', error: err.message })
  }
})

// app.post('/upload', (req, res) => {
//   if (!req.files || Object.keys(req.files).length === 0) {
//     return res.status(400).send('No files were uploaded.')
//   }

//   const file = req.files.file
//   file.mv(`${__dirname}/uploads/${file.name}`, (err) => {
//     if (err) {
//       return res.status(500).send(err)
//     }

//     // extractFile(`${__dirname}/uploads/${file.name}`, `${__dirname}/extracted`)
//     // processImage()

//     res.json({
//       fileName: file.name,
//       filePath: `/public/images/updated-world-map.jpeg`,
//     })
//   })
// })

app.get('/files', (req, res) => {
  try {
    const baseDirectory = path.join(__dirname, 'public')
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
