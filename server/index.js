const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const path = require('path')

const { extractFile, processImage } = require('./utils')
const app = express()

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(
  fileUpload({
    createParentPath: true,
  })
)
app.use(cors())

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  const file = req.files.file
  file.mv(`${__dirname}/uploads/${file.name}`, (err) => {
    if (err) {
      return res.status(500).send(err)
    }

    // extractFile(`${__dirname}/uploads/${file.name}`, `${__dirname}/extracted`)

    processImage()

    res.json({
      fileName: file.name,
      filePath: `/public/images/updated-world-map.jpeg`,
    })
  })
})

app.listen(5000, () => console.log('Server started on port 5000'))

// unzip grid
// read grid
// convert grid to jpeg
// return jpeg

// create canvas with grid
// draw grid
// convert canvas to jpeg
// return jpeg
