import { Router } from 'express'
import fs from 'fs/promises'
import path from 'path'
import { config } from '../config.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    const entries = await fs.readdir(config.uploadDir)
    const files = await Promise.all(
      entries.map(async (filename) => {
        const stat = await fs.stat(path.join(config.uploadDir, filename))
        return {
          filename,
          url: `${config.baseUrl}/${config.assetPath}/${filename}`,
          size: stat.size,
          uploadedAt: stat.birthtime,
        }
      })
    )
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    res.json(files)
  } catch {
    res.json([])
  }
})

router.delete('/:filename', async (req, res) => {
  const filename = path.basename(req.params.filename) // strip any path components
  const filepath = path.join(config.uploadDir, filename)

  try {
    await fs.unlink(filepath)
    res.json({ deleted: filename })
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'File not found' })
    throw err
  }
})

export default router
