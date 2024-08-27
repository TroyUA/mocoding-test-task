const express = require('express')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const path = require('path')

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
  file.mv(`${__dirname}/public/images/${file.name}`, (err) => {
    if (err) {
      return res.status(500).send(err)
    }

    // const resultImage = processImage(file)

    res.json({
      fileName: file.name,
      filePath: `/public/images/${file.name}`,
    })
  })
})

app.listen(5000, () => console.log('Server started on port 5000'))

function processImage(file) {
  console.log(file)
  return file
}
