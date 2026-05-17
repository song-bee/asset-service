import express from 'express'
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { config } from './config.js'
import uploadRouter from './routes/upload.js'
import filesRouter from './routes/files.js'

fs.mkdirSync(config.uploadDir, { recursive: true })

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use('/upload', uploadRouter)
app.use('/files', filesRouter)
app.get('/health', (_req, res) => res.json({ ok: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.listen(config.port, config.host, () => {
  console.log(`asset-service listening on ${config.host}:${config.port}`)
  console.log(`UI → http://${config.host}:${config.port}`)
  console.log(`Upload dir: ${config.uploadDir}`)
})
