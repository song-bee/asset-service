import express from 'express'
import fs from 'fs'
import { config } from './config.js'
import uploadRouter from './routes/upload.js'

fs.mkdirSync(config.uploadDir, { recursive: true })

const app = express()

app.use('/upload', uploadRouter)
app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(config.port, config.host, () => {
  console.log(`asset-service listening on ${config.host}:${config.port}`)
  console.log(`Upload dir: ${config.uploadDir}`)
  console.log(`Public base URL: ${config.baseUrl}/assets/`)
})
