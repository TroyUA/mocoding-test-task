import express from 'express'
import fileUpload from 'express-fileupload'

const app = express()

app.use(
  fileUpload({
    createParentPath: true,
  })
)

app.post('/upload', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.')
  }

  const file = req.files.file
  file.mv(`${__dirname}/uploads/${file.name}`, (err) => {
    if (err) {
      return res.status(500).send(err)
    }

    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`,
    })
  })
})

app.listen(5000, () => console.log('Server started on port 5000'))
