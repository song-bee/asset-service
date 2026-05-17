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
  app.js              entry point — mounts routes, serves public/, calls listen
  config.js           all env vars parsed in one place
  public/
    index.html        web UI for browsing and uploading files
  routes/
    upload.js         POST /upload — multer handler, returns { url, filename, size }
    files.js          GET /files — list files; DELETE /files/:filename — delete a file
deploy/
  ecosystem.config.cjs  pm2 config
  nginx-assets.conf     nginx snippet (add inside your server {} block)
scripts/
  deploy.sh           rsync + pm2 reload over SSH
```

## Architecture

Single Express app bound to `127.0.0.1`. nginx handles four concerns:

- `GET /assets/{filename}` — served directly from `UPLOAD_DIR` (Node not in read path)
- `GET /asset-service/` — proxied to Node's `express.static` (web UI)
- `POST /upload` — proxied to Node upload handler
- `GET|DELETE /files` — proxied to Node files handler

Uploads are given UUID-based filenames to avoid collisions. No database — state is the filesystem.

## Key env vars

| Var | Default | Purpose |
|-----|---------|---------|
| `UPLOAD_DIR` | `./uploads` | Where files are stored; must match nginx `alias` |
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
