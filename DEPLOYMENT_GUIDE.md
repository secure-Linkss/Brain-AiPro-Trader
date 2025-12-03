# 🚀 DEPLOYMENT GUIDE
**Brain AiPro Trader - Production Deployment**

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] PostgreSQL database provisioned
- [ ] Domain name configured
- [ ] SSL certificate obtained
- [ ] Environment variables prepared
- [ ] API keys collected (optional for AI providers)

---

## 🔧 STEP 1: ENVIRONMENT SETUP

### 1.1 Install Dependencies

**Frontend (Node.js 18+)**:
```bash
cd /path/to/project
npm install
```

**Backend (Python 3.10+)**:
```bash
cd python-services
pip install -r requirements.txt
```

### 1.2 Configure Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/brainai"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# AI Providers (Optional - System has free fallbacks)
GEMINI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENROUTER_API_KEY="your-openrouter-key"

# FRED API (Economic Calendar - Already configured)
FRED_API_KEY="2cd86b707974df1f23d27d9cd1101317"

# Email (Optional - for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

---

## 🗄️ STEP 2: DATABASE SETUP

### 2.1 Run Migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 2.2 Seed Initial Data (Optional)

```bash
npx prisma db seed
```

### 2.3 Verify Schema

```bash
npx prisma studio
# Opens GUI at http://localhost:5555
```

---

## 🏗️ STEP 3: BUILD APPLICATION

### 3.1 Build Frontend

```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (13/13)
✓ Finalizing page optimization
```

### 3.2 Test Production Build Locally

```bash
npm run start
# Visit http://localhost:3000
```

---

## 🐍 STEP 4: DEPLOY PYTHON BACKEND

### 4.1 Using Uvicorn (Development/Small Scale)

```bash
cd python-services
uvicorn backtesting_engine.main:app --host 0.0.0.0 --port 8003 --workers 4
```

### 4.2 Using Gunicorn (Production Recommended)

```bash
pip install gunicorn
gunicorn backtesting_engine.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8003 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

### 4.3 Using Docker (Recommended for Production)

Create `Dockerfile` in `python-services/`:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "backtesting_engine.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8003"]
```

Build and run:
```bash
docker build -t brainai-backend .
docker run -d -p 8003:8003 --env-file ../.env brainai-backend
```

---

## 🌐 STEP 5: DEPLOY FRONTEND

### 5.1 Using Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

**Configuration**:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 5.2 Using Docker

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t brainai-frontend .
docker run -d -p 3000:3000 --env-file .env brainai-frontend
```

### 5.3 Using PM2 (VPS Deployment)

```bash
npm install -g pm2
pm2 start npm --name "brainai-frontend" -- start
pm2 save
pm2 startup
```

---

## 🔄 STEP 6: REVERSE PROXY (NGINX)

### 6.1 Install NGINX

```bash
sudo apt update
sudo apt install nginx
```

### 6.2 Configure NGINX

Create `/etc/nginx/sites-available/brainai`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Python FastAPI)
    location /api/python/ {
        proxy_pass http://localhost:8003/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/brainai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 STEP 7: SSL CERTIFICATE (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Auto-renewal:
```bash
sudo certbot renew --dry-run
```

---

## 📊 STEP 8: MONITORING & LOGGING

### 8.1 Application Monitoring

**PM2 Monitoring**:
```bash
pm2 monit
```

**Docker Logs**:
```bash
docker logs -f brainai-frontend
docker logs -f brainai-backend
```

### 8.2 Database Monitoring

```bash
# PostgreSQL stats
psql -U user -d brainai -c "SELECT * FROM pg_stat_activity;"
```

### 8.3 System Resources

```bash
# Install htop
sudo apt install htop
htop
```

---

## 🧪 STEP 9: POST-DEPLOYMENT TESTING

### 9.1 Health Checks

```bash
# Frontend
curl https://yourdomain.com

# Backend API
curl https://yourdomain.com/api/python/

# Database Connection
curl https://yourdomain.com/api/health
```

### 9.2 Feature Testing

1. **Authentication**:
   - [ ] User registration
   - [ ] Login
   - [ ] 2FA setup
   - [ ] Password reset

2. **Trading Features**:
   - [ ] Market Overview page loads
   - [ ] TradingView widgets render
   - [ ] News & Sentiment analysis works
   - [ ] Risk Management calculator functions

3. **Admin Panel**:
   - [ ] AI Provider management
   - [ ] User management
   - [ ] Security logs visible

### 9.3 Performance Testing

```bash
# Load test with Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# API endpoint test
ab -n 100 -c 5 https://yourdomain.com/api/python/
```

---

## 🔧 STEP 10: MAINTENANCE

### 10.1 Backup Strategy

**Database Backup (Daily)**:
```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U user brainai > /backups/brainai_$DATE.sql
# Keep only last 7 days
find /backups -name "brainai_*.sql" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

### 10.2 Update Procedure

```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install
pip install -r python-services/requirements.txt

# Run migrations
npx prisma migrate deploy

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
# OR
docker-compose restart
```

---

## 🚨 TROUBLESHOOTING

### Issue: Frontend won't build
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Python backend crashes
```bash
# Check logs
journalctl -u brainai-backend -f

# Verify Python packages
pip list | grep -E "fastapi|uvicorn|pandas"
```

### Issue: Database connection fails
```bash
# Test connection
psql -U user -h host -d brainai

# Check DATABASE_URL format
echo $DATABASE_URL
```

---

## 📞 SUPPORT

For deployment issues, refer to:
- `FINAL_AUDIT_REPORT.md` - Feature completeness
- `README.md` - Quick start guide
- `SETUP_GUIDE.md` - Development setup

---

**Deployment Complete! 🎉**

Your Brain AiPro Trader platform is now live and ready for institutional trading.
