# Private Asset Service

Private upload API that saves files locally and serves them as public static URLs under your main domain. Includes a web UI for browsing and managing uploaded files.

The upload endpoint binds to `127.0.0.1` only — it's never exposed publicly. nginx serves uploaded files directly from disk as static assets.

## How it works

```
your app  →  POST http://127.0.0.1:3001/upload  →  saved to UPLOAD_DIR/<name>.ext
internet  →  GET  https://yourdomain.com/assets/<name>.ext  →  served by nginx (no Node)
browser   →  GET  https://yourdomain.com/asset-service/    →  web UI proxied via nginx
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

> `.env` is loaded by `src/config.js` at startup — no CLI flags or extra packages needed.

**3. Add nginx config**

Add `deploy/nginx-assets.conf` inside your existing `server {}` block, then reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

The nginx snippet configures four locations:
- `/assets/` — static files served directly from `UPLOAD_DIR`
- `/asset-service/` — web UI proxied to Node
- `/upload` — upload API proxied to Node
- `/files` — file list/delete API proxied to Node

**4. Start**
```bash
npm start          # production
npm run dev        # development with file watching
```

## Deploy

```bash
SSH_HOST=1.2.3.4 SSH_USER=deploy REMOTE_PATH=/srv/asset-service ./scripts/deploy.sh
```

The script rsyncs source files, installs prod deps, then does `pm2 reload` (or `pm2 start` on first run). Your `.env` on the server is never touched by rsync.

First time on the server:
```bash
sudo mkdir -p /var/www/assets && sudo chown deploy:deploy /var/www/assets
sudo mkdir -p /srv/asset-service
# create /srv/asset-service/.env with your production values
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

## API

### `POST /upload`

Accepts `multipart/form-data` with a `file` field and an optional `name` field.

```bash
# Auto-named (UUID)
curl -F "file=@photo.jpg" http://127.0.0.1:3001/upload

# Custom name
curl -F "name=hero-banner" -F "file=@photo.jpg" http://127.0.0.1:3001/upload
```

```json
{
  "url": "https://yourdomain.com/assets/hero-banner.jpg",
  "filename": "hero-banner.jpg",
  "size": 84231
}
```

### `GET /files`

Returns all uploaded files sorted newest-first.

```json
[
  {
    "filename": "hero-banner.jpg",
    "url": "https://yourdomain.com/assets/hero-banner.jpg",
    "size": 84231,
    "uploadedAt": "2026-05-17T10:00:00.000Z"
  }
]
```

### `DELETE /files/:filename`

Deletes a file from disk. Returns `{ "deleted": "<filename>" }` or `404` if not found.

### `GET /health`

```json
{ "ok": true }
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost` | Prepended to filenames in returned URLs |
| `UPLOAD_DIR` | `./uploads` | Where files are stored — must match nginx `alias` on the server |
| `PORT` | `3001` | Listen port |
| `HOST` | `127.0.0.1` | Bind address |
| `MAX_FILE_SIZE_MB` | `50` | Upload size limit |
