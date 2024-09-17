const path = require('path')
const fs = require('fs')
const multer = require('multer')

const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }) // Create the directory if it doesn't exist
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir)
  },
  filename(req, file, cb) {
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    cb(null, `${timestamp}-${file.originalname}`)
  },
})

const allowedTypes = ['application/x-zip-compressed', 'application/zip']
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
module.exports = multer({ storage, fileFilter })
