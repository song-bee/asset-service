import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import { Router } from 'express'
import { config } from '../config.js'

const storage = multer.diskStorage({
  destination: config.uploadDir,
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
})

const router = Router()

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided. Send multipart/form-data with a "file" field.' })
  }
  res.json({
    url: `${config.baseUrl}/assets/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  })
})

export default router
