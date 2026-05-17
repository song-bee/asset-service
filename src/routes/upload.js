import multer from 'multer'
import { randomUUID } from 'crypto'
import path from 'path'
import fs from 'fs/promises'
import { Router } from 'express'
import { config } from '../config.js'

function sanitizeName(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+/, '')
    .slice(0, 200)
}

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

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided. Send multipart/form-data with a "file" field.' })
  }

  let finalFilename = req.file.filename

  if (req.body.name?.trim()) {
    const ext = path.extname(req.file.originalname).toLowerCase()
    const base = sanitizeName(req.body.name.trim())
    const named = base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`
    await fs.rename(req.file.path, path.join(config.uploadDir, named))
    finalFilename = named
  }

  res.json({
    url: `${config.baseUrl}/assets/${finalFilename}`,
    filename: finalFilename,
    size: req.file.size,
  })
})

export default router
