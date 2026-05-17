# asset-service

Private upload API that saves files locally and serves them as public static URLs under your main domain.

The upload endpoint binds to `127.0.0.1` only — it's never exposed publicly. nginx serves uploaded files directly from disk as static assets.

## How it works

```
your app  →  POST http://127.0.0.1:3001/upload  →  saved to /var/www/assets/<uuid>.ext
internet  →  GET  https://yourdomain.com/assets/<uuid>.ext  →  served by nginx
```

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
# Edit .env — at minimum set BASE_URL to your domain
```

**3. Add nginx static file serving**

Add `deploy/nginx-assets.conf` inside your existing `server {}` block, then reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

**4. Start**
```bash
npm start
# or for development:
npm run dev
```

## Deploy

```bash
SSH_HOST=1.2.3.4 SSH_USER=deploy REMOTE_PATH=/srv/asset-service ./scripts/deploy.sh
```

First time on the server:
```bash
sudo mkdir -p /var/www/assets && sudo chown deploy:deploy /var/www/assets
sudo mkdir -p /srv/asset-service
# create /srv/asset-service/.env with your production values
```

## API

### `POST /upload`

Accepts `multipart/form-data` with a `file` field.

```bash
curl -F "file=@photo.jpg" http://127.0.0.1:3001/upload
```

```json
{
  "url": "https://yourdomain.com/assets/3f2e1a4b-....jpg",
  "filename": "3f2e1a4b-....jpg",
  "size": 84231
}
```

### `GET /health`

```json
{ "ok": true }
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost` | Prepended to filenames in returned URLs |
| `UPLOAD_DIR` | `/var/www/assets` | Where files are stored — must match nginx `alias` |
| `PORT` | `3001` | Listen port |
| `HOST` | `127.0.0.1` | Bind address |
| `MAX_FILE_SIZE_MB` | `50` | Upload size limit |
