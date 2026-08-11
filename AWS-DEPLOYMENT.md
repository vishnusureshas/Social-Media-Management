# Deploy to AWS EC2 (Free Tier) + CI/CD Pipeline

This guide takes the **Nexus Social Platform** (backend + frontend + Redis) from your local machine to a free-tier **AWS EC2** instance with an automated **GitHub Actions** CI/CD pipeline.

After finishing this guide:
- Your app is live at `http://<EC2-PUBLIC-IP>` (frontend) and `http://<EC2-PUBLIC-IP>:5002/api` (API).
- Every push to the `main` branch automatically rebuilds images, pushes them to **GitHub Container Registry (GHCR)**, and redeploys the EC2 server.

---

## 1. Architecture Overview

```
GitHub (repo: vishnusureshas/Social-Media-Management)
   |  push to main
   v
GitHub Actions  --builds-->  GHCR (ghcr.io/vishnusureshas/social-media-management/backend + /frontend)
   |  SSH into EC2
   v
EC2 (Ubuntu 22.04, t2.micro / t3.micro, free tier)
   |  docker compose up -d
   |-- nexus-frontend  (nginx :80   -> SPA + /api proxy)
   |-- nexus-backend   (node  :5002 -> :5000)
   |-- nexus-redis     (redis internal, no host port)
        |
        +-- MongoDB Atlas (cloud, already used - NOT on EC2)
```

Why MongoDB Atlas instead of MongoDB on EC2? A free `t2.micro` has only **1 GB RAM**; running MongoDB on it would exhaust memory. Your backend already points at MongoDB Atlas, so nothing changes there.

---

## 2. Prerequisites

1. AWS account eligible for **Free Tier** (new accounts get 750 hrs/month of `t2.micro`/`t3.micro` for 12 months).
2. Repo pushed to GitHub (`vishnusureshas/Social-Media-Management`) - already done.
3. An SSH key pair to log into EC2. If you don't have one on Windows:

   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com" -f $env:USERPROFILE\.ssh\id_ed25519
   ```

   You get `id_ed25519` (private - keep secret) and `id_ed25519.pub` (public - used on EC2).

---

## 3. Create the EC2 Instance (Free Tier)

1. Go to **EC2 Console** -> **Launch instance**.
2. **Name:** `nexus-social-platform`
3. **Application and OS Images:** Ubuntu -> **Ubuntu Server 22.04 LTS (HVM)**, architecture **x86_64**.
4. **Instance type:** `t2.micro` (or `t3.micro`) - the free-tier eligible sizes.
5. **Key pair (login):** create a new key pair or use your existing one. Keep the `.pem` file safe.
6. **Network settings -> Edit:**
   - VPC: default
   - **Allow SSH traffic from:** `My IP` (or `0.0.0.0/0` if you prefer, less safe)
   - **Allow HTTP traffic from the internet:** checked (needed for the frontend)
   - **Allow HTTPS:** checked (if you add SSL later)
7. **Configure storage:** leave at 30 GB gp3 (free tier covers 30 GB).
8. Click **Launch instance**.

> Note: if your account previously used a free-tier instance, you may be charged. See Section 14.

---

## 4. Security Group (ports)

After the instance is running, go to **Security** -> **Security groups** and confirm (or add) these **inbound rules**:

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | Your IP (or 0.0.0.0/0) | Admin access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend web UI |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Optional SSL |
| Custom TCP | TCP | 5002 | 0.0.0.0/0 | Backend API (optional) |

> Best practice: keep port 5002 closed and rely on the nginx `/api` proxy on port 80. Open 5002 only if you want to hit the API directly.

---

## 5. Allocate an Elastic IP (recommended)

EC2 public IPs change on every stop/start. A free-tier account gets **1 free Elastic IP**.

1. EC2 Console -> **Elastic IPs** -> **Allocate Elastic IP address**.
2. Select it -> **Actions -> Associate Elastic IP address** -> pick your instance -> **Associate**.
3. Note the IP - this becomes your permanent `EC2_HOST`.

> An Elastic IP that is **not associated** with a running instance incurs charges. Always keep it attached, or release it when done.

---

## 6. Connect to the Instance

On Windows (PowerShell):

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@<PUBLIC_IP>
```

If using a `.pem` file and Windows complains about permissions:

```powershell
icacls "$env:USERPROFILE\.ssh\id_ed25519.pem" /inheritance:r /grant:r "$($env:USERNAME):(R)"
```

> `ubuntu` is the default username for Ubuntu AMIs.

---

## 7. Install Docker + Docker Compose on EC2

Run these **on the instance** (in the SSH session):

```bash
# Update the system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so docker works without sudo)
sudo usermod -aG docker $USER

# Enable Docker on boot
sudo systemctl enable docker && sudo systemctl start docker

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

**Log out and log back in** so the `docker` group takes effect, then verify:

```bash
exit
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@<PUBLIC_IP>
docker ps   # should show no error
```

---

## 8. Add Swap Memory (important for 1 GB free-tier RAM)

A `t2.micro` has 1 GB RAM. Node + nginx + Redis is tight, so add 2 GB swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # verify Swap shows ~2G
```

---

## 9. CI/CD Pipeline (GitHub Actions)

The pipeline is defined in `.github/workflows/deploy.yml` (committed to the repo). It:

1. **Builds** the backend and frontend Docker images (Linux/amd64 - EC2 free tier is x86).
2. **Pushes** them to **GHCR** (`ghcr.io/vishnusureshas/social-media-management/backend` and `/frontend`).
3. **SSHes into EC2**, writes the production `.env`, pulls the images, and runs `docker compose up -d`.
4. **Verifies** the backend health endpoint.

### 9.1 Repository files

**`.github/workflows/deploy.yml`** - the pipeline itself:

```yaml
name: Deploy to AWS EC2

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: ghcr.io/vishnusureshas/social-media-management/backend
  FRONTEND_IMAGE: ghcr.io/vishnusureshas/social-media-management/frontend

jobs:
  build-and-push:
    name: Build & push images
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & push backend
        uses: docker/build-push-action@v6
        with:
          context: ./backend
          file: ./backend/Dockerfile
          platforms: linux/amd64
          push: true
          tags: |
            ${{ env.BACKEND_IMAGE }}:latest
            ${{ env.BACKEND_IMAGE }}:${{ github.sha }}

      - name: Build & push frontend
        uses: docker/build-push-action@v6
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          platforms: linux/amd64
          push: true
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}

  deploy:
    name: Deploy to EC2
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/app
            echo "MONGODB_URI=${{ secrets.MONGODB_URI }}" > .env
            echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> .env
            echo "JWT_EXPIRES_IN=${{ secrets.JWT_EXPIRES_IN }}" >> .env
            echo "REFRESH_SECRET=${{ secrets.REFRESH_SECRET }}" >> .env
            echo "REFRESH_EXPIRES_IN=${{ secrets.REFRESH_EXPIRES_IN }}" >> .env
            echo "CLIENT_URL=http://${{ secrets.EC2_HOST }}" >> .env
            echo "CLOUDINARY_CLOUD_NAME=${{ secrets.CLOUDINARY_CLOUD_NAME }}" >> .env
            echo "CLOUDINARY_API_KEY=${{ secrets.CLOUDINARY_API_KEY }}" >> .env
            echo "CLOUDINARY_API_SECRET=${{ secrets.CLOUDINARY_API_SECRET }}" >> .env
            echo "SMTP_HOST=${{ secrets.SMTP_HOST }}" >> .env
            echo "SMTP_PORT=${{ secrets.SMTP_PORT }}" >> .env
            echo "SMTP_USER=${{ secrets.SMTP_USER }}" >> .env
            echo "SMTP_PASS=${{ secrets.SMTP_PASS }}" >> .env

            export TAG=${{ github.sha }}

            docker login ghcr.io -u ${{ github.actor }} -p ${{ secrets.GITHUB_TOKEN }}
            docker compose pull
            docker compose up -d
            sleep 15
            curl -sf http://localhost:5002/api/v1/health && echo "DEPLOY OK" || echo "HEALTH CHECK FAILED"
```

**`docker-compose.prod.yml`** - production compose that pulls prebuilt images instead of building. This is what runs on EC2 in `~/app`:

```yaml
name: nexus-social-platform

services:
  backend:
    image: ghcr.io/vishnusureshas/social-media-management/backend:${TAG:-latest}
    container_name: nexus-backend
    restart: unless-stopped
    ports:
      - "5002:5000"
    env_file: .env
    environment:
      NODE_ENV: production
      PORT: 5000
      REDIS_URL: redis://redis:6379
      REDIS_ENABLED: "true"
    depends_on:
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/api/v1/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    networks:
      - nexus-net

  redis:
    image: redis:7-alpine
    container_name: nexus-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks:
      - nexus-net

  frontend:
    image: ghcr.io/vishnusureshas/social-media-management/frontend:${TAG:-latest}
    container_name: nexus-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - nexus-net

volumes:
  redis-data:

networks:
  nexus-net:
    driver: bridge
```

> Port mappings differ from the local `docker-compose.yml`: on EC2 the frontend uses standard port **80** and the backend exposes **5002** on the host. Redis stays **internal-only** (no host port) for security.

### 9.2 One-time EC2 setup for the pipeline

Run **on the instance** once:

```bash
mkdir -p ~/app && cd ~/app
# Download the production compose file from your repo
curl -o docker-compose.yml https://raw.githubusercontent.com/vishnusureshas/Social-Media-Management/main/docker-compose.prod.yml
ls -la   # verify docker-compose.yml exists
```

### 9.3 Add GitHub repository secrets

Go to your repo -> **Settings -> Secrets and variables -> Actions -> New repository secret**. Add each:

| Secret name | Value |
|---|---|
| `EC2_HOST` | Your Elastic IP (e.g. `3.123.45.67`) |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_SSH_KEY` | The **entire content** of your private key (including `-----BEGIN OPENSSH PRIVATE KEY-----` / `-----BEGIN RSA PRIVATE KEY-----`) |
| `MONGODB_URI` | Your Atlas connection string (from `backend/.env`) |
| `JWT_SECRET` | Your JWT secret |
| `JWT_EXPIRES_IN` | `1h` |
| `REFRESH_SECRET` | Your refresh secret |
| `REFRESH_EXPIRES_IN` | `30d` |
| `CLOUDINARY_CLOUD_NAME` | From `backend/.env` |
| `CLOUDINARY_API_KEY` | From `backend/.env` |
| `CLOUDINARY_API_SECRET` | From `backend/.env` |
| `SMTP_HOST` | `smtp.gmail.com` (or your provider) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | From `backend/.env` |
| `SMTP_PASS` | From `backend/.env` |

> The pipeline uses `secrets.GITHUB_TOKEN` to push images to GHCR, so no personal access token is needed. However, by default GHCR packages are **private** - they will only be readable by your account (which is fine since EC2 logs in as you via `GITHUB_TOKEN`-generated credentials during deploy). To make them public: package page -> **Package settings** -> **Danger Zone -> Change visibility -> Public**.

### 9.4 Trigger the pipeline

Push to `main`:

```powershell
git add .
git commit -m "Add CI/CD deployment pipeline"
git push origin main
```

Watch the run at your repo -> **Actions** tab. On success, the app is live at `http://<EC2_HOST>`.

---

## 10. Verify the Deployment

From your local machine:

```powershell
# Frontend
Invoke-WebRequest -Uri "http://<EC2_HOST>/" -UseBasicParsing

# Backend health through nginx proxy
Invoke-RestMethod -Uri "http://<EC2_HOST>/api/v1/health"

# Backend health directly (only if port 5002 is open)
Invoke-RestMethod -Uri "http://<EC2_HOST>:5002/api/v1/health"
```

Expected health response:

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "db": "connected",
    "cache": "connected"
  }
}
```

On the instance, verify containers:

```bash
docker ps
docker logs nexus-backend --tail 50
docker exec nexus-redis redis-cli ping   # PONG
```

---

## 11. Add HTTPS with a Free SSL Certificate (optional but recommended)

Use **Certbot** on the EC2 instance. Requires a domain name pointing to your Elastic IP (e.g. an A record `app.example.com -> <EC2_HOST>`).

```bash
cd ~/app
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and auto-configure nginx
sudo certbot --nginx -d app.example.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Then update `CLIENT_URL` secret to `https://app.example.com` and redeploy.

---

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| Pipeline fails at "Log in to GHCR" | Re-check `GITHUB_TOKEN` permissions; repo must allow `packages: write` |
| `docker compose pull` fails with unauthorized | On EC2, run `docker login ghcr.io -u <your-gh-username> -p <PAT-with-read:packages>` once, or ensure the workflow logs in first |
| Backend container restarting (`querySrv` / DNS errors) | Transient Docker Desktop DNS issue locally; on EC2 it usually resolves. Check `docker logs nexus-backend` |
| `Bind for 0.0.0.0:80 failed` on EC2 | Another service occupies port 80. Run `sudo lsof -i :80` and stop it |
| MongoDB connection refused | Verify `MONGODB_URI` secret is correct and Atlas allows access from your EC2 IP (Atlas Network Access -> Add IP `0.0.0.0/0` in dev) |
| Frontend loads but API calls fail | Check the nginx `/api` proxy: `curl http://localhost:5002/api/v1/health` inside the instance; verify `depends_on: backend` in compose |
| Out of memory / killed process | Increase swap (Section 8) or use `t3.small` temporarily |
| Elastic IP charged | It must stay attached to a running instance, or release it |

---

## 13. Re-deploy & Rollback

- **Every push to `main`** triggers a new deploy automatically.
- **Rollback:** in the workflow, `TAG` = git commit SHA. To roll back to an older commit:

  ```bash
  cd ~/app
  export TAG=<old-sha>
  docker compose pull
  docker compose up -d
  ```

---

## 14. Staying within the Free Tier (cost control)

- `t2.micro`/`t3.micro` for 750 hrs/month is free for 12 months (or free on a fresh account).
- Keep the Elastic IP **attached** to a running instance.
- 30 GB gp3 EBS is included in free tier.
- Data transfer out: 100 GB/month free.
- **Stop** the instance when not in use (you still pay a few cents for EBS storage while stopped, but not for compute).

---

## 15. Useful Production Checks

1. Set `NODE_ENV=production` (already in `docker-compose.prod.yml`).
2. Rotate `JWT_SECRET` / `REFRESH_SECRET` to long random values.
3. Add Redis auth/password for a truly public setup (optional in dev).
4. Point your domain's DNS to the Elastic IP and add HTTPS (Section 11).
5. Monitor with `docker logs` or a free uptime monitor (e.g. UptimeRobot).


