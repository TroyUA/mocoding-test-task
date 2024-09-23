import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { Request } from 'express'
import { UPLOAD_PATH } from '../utils/constants'

const uploadDir = path.resolve(UPLOAD_PATH)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }) // Create the directory if it doesn't exist
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir)
  },
  filename(_req, file, cb) {
    const timestamp = new Date().toISOString().replace(/:/g, '-')
    cb(null, `${timestamp}-${file.originalname}`)
  },
})

const allowedTypes = ['application/x-zip-compressed', 'application/zip']
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
export default multer({ storage, fileFilter })
