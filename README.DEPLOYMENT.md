# Learnova — Docker + CI/CD Deployment

Pushes to `main` run GitHub Actions: quality checks → build & push Docker images to
Docker Hub → SSH deploy to an AWS EC2 instance running Docker Compose + Nginx.

## Architecture

```
EC2 (Ubuntu, t3.micro, 1GB RAM)
│
├── Nginx (host, port 80)
│     ├── /              → 127.0.0.1:3000  (learnova-client, Next.js standalone)
│     └── /api/v1        → 127.0.0.1:5000  (learnova-server, Express)
│         /api/auth
│         /webhook
│
└── Docker Compose
      ├── learnova-db      postgres:16-alpine (volume learnova-pgdata)
      ├── learnova-server  Learnova image, env_file ./server/.env.production
      └── learnova-client  Learnova image, JWT secrets via environment
```

## Prerequisites (credentials)

1. **Docker Hub** account + access token with Read/Write/Delete permissions.
2. **AWS EC2 Free Tier** instance (see below).
3. **GitHub repo** `Tanvir-Bhuiyan00/Learnova` with these Actions secrets set:
   - `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
   - `VPS_HOST` (EC2 public IP), `VPS_USER` (`ubuntu`), `VPS_SSH_KEY` (the `.pem` contents), `VPS_APP_DIR` (e.g. `/opt/apps/learnova`)
   - `CLIENT_PUBLIC_API_BASE_URL` (e.g. `http://<EC2-IP>/api/v1`)
   - `ACCESS_TOKEN_SECRET`, `JWT_ACCESS_SECRET`, `POSTGRES_PASSWORD`
   - `SERVER_ENV_PRODUCTION` — the full contents of `server/.env.production`

   If you have `gh` CLI installed, `script/set-github-secrets.sh` sets all of them
   from `server/.env.production` + `ci/github-secrets.input.env`.

## Production env file

Create `server/.env.production` (copy `server/.env.example`):

```env
DATABASE_URL="postgresql://learnova:<STRONG_PASSWORD>@learnova-db:5432/learnova?schema=public"
POSTGRES_PASSWORD=<STRONG_PASSWORD>          # must match the one inside DATABASE_URL
BETTER_AUTH_URL=http://<EC2-IP>
FRONTEND_URL=http://<EC2-IP>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/callback/google  # Google blocks IPs; keep localhost unless you add a domain + HTTPS
```

Notes:
- The compose database container is named `learnova-db` — the DATABASE_URL host must stay `learnova-db`, not the Accelerate pooled URL.
- Cookies are served without `Secure` over plain HTTP automatically, so login works on an IP-only site.
- Google social login requires a real domain + HTTPS; email/password auth works over HTTP.
- `!` is safe in a URL, but characters like `@`, `:`, `/`, `#`, `%` in the DB password must be URL-encoded.

## AWS EC2 (Free Tier) setup

1. **Launch instance**: Ubuntu Server 24.04 LTS (x86), **t3.micro** (free tier),
   20 GB gp3 volume, key pair `learnova` (save the `.pem`).
2. **Security group**: allow SSH (22) from your IP, **HTTP (80) from anywhere**.
3. Copy the **Public IPv4 address** → that is `VPS_HOST`; `VPS_USER=ubuntu`.
4. (Recommended) Allocate an **Elastic IP** and associate it with the instance so
   the address never changes.

## One-time VPS bootstrap (run manually over SSH)

```bash
ssh -i learnova.pem ubuntu@<EC2-IP>
```

```bash
# 1. Swap (t3.micro has 1GB RAM — Postgres + Node + RAG model need headroom)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 2. Docker + Compose + Nginx
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
sudo apt-get update && sudo apt-get install -y nginx

# 3. Clone the repo where VPS_APP_DIR points
sudo mkdir -p /opt/apps && sudo chown ubuntu:ubuntu /opt/apps
cd /opt/apps && git clone https://github.com/Tanvir-Bhuiyan00/Learnova.git learnova

# 4. Nginx
sudo cp ~/learnova/nginx/learnova.conf /etc/nginx/sites-available/learnova
sudo ln -sf /etc/nginx/sites-available/learnova /etc/nginx/sites-enabled/learnova
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Log out and back in so the `docker` group takes effect.

## Deploy

```bash
git push -u origin main
```

The workflow then:
1. Runs quality checks (lint, prisma generate, server build, client build).
2. Builds + pushes `learnova-server` / `learnova-client` images to Docker Hub.
3. SSHes to the EC2 box, pulls images, starts Postgres, runs
   `prisma migrate deploy` + `prisma db push` (the RAG table is maintained by push),
   seeds demo courses + RAG index on first deploy, then starts server + client.

## Verification

```bash
ssh -i learnova.pem ubuntu@<EC2-IP>

curl -s http://localhost:5000/api/v1/rag/stats      # server + DB
curl -sI http://localhost:3000                      # client
curl -sI http://<EC2-IP>/                           # through Nginx
docker compose -f docker-compose.prod.yaml ps
```

## Troubleshooting

- **First RAG query is slow** — the embedding model (`bge-base-en-v1.5`) downloads
  from Hugging Face on first use and is not persisted across container restarts.
- **Login cookies not set** — servers behind Nginx share one origin; keep
  `FRONTEND_URL`/`BETTER_AUTH_URL` equal to the public URL.
- **GitHub Actions deploy fails on seed step** — DB migrated but seeding missed;
  re-run the deploy (push an empty commit `git commit --allow-empty -m retry`) —
  the `.seeded` marker is only created on success.
- **Reset the database**: `docker compose -f docker-compose.prod.yaml down -v`,
  restart the deploy. `.seeded` marker: `rm /opt/apps/learnova/.seeded`.