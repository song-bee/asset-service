import fs from 'fs'
import path from 'path'

function loadDotEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        if (key && value !== undefined && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
}

loadDotEnv()

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '127.0.0.1',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost',
  assetPath: (process.env.ASSET_PATH || 'assets').replace(/^\/|\/$/g, ''),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50'),
}
