export const config = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '127.0.0.1',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  baseUrl: process.env.BASE_URL || 'http://localhost',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '50'),
}
