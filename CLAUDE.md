# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm start            # production
npm run dev          # development with file watching (Node 18+)
```

## Deploy

```bash
SSH_HOST=1.2.3.4 SSH_USER=deploy REMOTE_PATH=/srv/asset-service ./scripts/deploy.sh
```

The script rsyncs `src/`, `package.json`, and `deploy/ecosystem.config.cjs` to the server, runs `npm install --omit=dev`, then does `pm2 reload` (or `pm2 start` on first run).

## Structure

```
src/
  app.js              entry point — mounts routes, calls listen
  config.js           all env vars parsed in one place
  routes/
    upload.js         POST /upload — multer handler, returns { url, filename, size }
deploy/
  ecosystem.config.cjs  pm2 config
  nginx-assets.conf     nginx snippet (add inside your server {} block)
scripts/
  deploy.sh           rsync + pm2 reload over SSH
```

## Architecture

Single Express app bound to `127.0.0.1` — never exposed publicly. nginx serves `GET /assets/{filename}` directly from `UPLOAD_DIR` as static files; Node is not in the read path.

Uploads are given UUID-based filenames to avoid collisions. No database — state is the filesystem.

## Key env vars

| Var | Default | Purpose |
|-----|---------|---------|
| `UPLOAD_DIR` | `/var/www/assets` | Where files are stored; must match nginx `alias` |
| `BASE_URL` | `http://localhost` | Prepended to UUID filename in the returned URL |
| `MAX_FILE_SIZE_MB` | `50` | multer file size limit |
| `HOST` | `127.0.0.1` | Bind address |
| `PORT` | `3001` | Listen port |

## First deploy (server setup)

```bash
# On the server once:
sudo mkdir -p /var/www/assets && sudo chown deploy:deploy /var/www/assets
sudo mkdir -p /srv/asset-service

# Add deploy/nginx-assets.conf into your nginx server{} block, then:
sudo nginx -t && sudo systemctl reload nginx
```
