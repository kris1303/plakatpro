# 🚀 PlakatPro - Deployment Guide

Anleitung für das Deployment auf Vercel.

---

## Voraussetzungen

- [x] GitHub Repository erstellt ✅
- [x] Code gepusht ✅
- [ ] Vercel Account erstellen
- [ ] Neon Datenbank (Production)
- [ ] Google Cloud APIs konfiguriert

---

## Option 1: Vercel Deployment (Empfohlen)

### 1. Vercel Account erstellen

1. Gehe zu [vercel.com](https://vercel.com)
2. Sign up mit GitHub
3. Authorisiere Vercel für deine Repositories

### 2. Neues Projekt importieren

1. **Import Project**
   - Wähle: `kris1303/plakatpro`
   - Framework Preset: **Next.js** (automatisch erkannt)
   - Root Directory: `./`

2. **Build Settings**
   ```
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

3. **Environment Variables** ⚠️ WICHTIG!

   Füge folgende Variablen hinzu:

   ```env
   # Datenbank (Neon Production)
   DATABASE_URL=postgresql://user:pass@prod-host.neon.tech/plakatpro?sslmode=require
   
   # Google Maps
   GOOGLE_MAPS_API_KEY=your_production_api_key
   
   # Google Photos OAuth
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=https://yourdomain.vercel.app/api/auth/google/callback
   
   # App
   APP_URL=https://yourdomain.vercel.app
   SESSION_SECRET=sehr_langer_zufälliger_string_für_produktion_min_32_zeichen
   NODE_ENV=production
   
   # Optional: SMTP
   SMTP_HOST=smtp.mailbox.org
   SMTP_PORT=587
   SMTP_USER=info@deine-domain.de
   SMTP_PASS=***
   SMTP_FROM="Werbeinsel <info@deine-domain.de>"
   ```

4. **Deploy!**
   - Klicke "Deploy"
   - Deployment dauert ~2-3 Minuten

### 3. Nach dem Deployment

#### A) Domain konfigurieren (Optional)

1. **Vercel Dashboard** → dein Projekt
2. **Settings** → **Domains**
3. Domain hinzufügen: `plakatpro.deine-domain.de`
4. DNS-Einträge bei deinem Provider setzen:
   ```
   Type: CNAME
   Name: plakatpro
   Value: cname.vercel-dns.com
   ```

#### B) Google OAuth Redirect URI aktualisieren

1. **Google Cloud Console** → OAuth 2.0 Client
2. **Authorized redirect URIs** hinzufügen:
   ```
   https://yourdomain.vercel.app/api/auth/google/callback
   ```

#### C) Datenbank-Migration ausführen

```bash
# Lokal mit Production-DB-URL
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy

# Oder über Vercel CLI
vercel env pull
pnpm prisma migrate deploy
```

---

## Option 2: Andere Hosting-Provider

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm prisma:generate && pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

**next.config.ts anpassen:**
```typescript
export default {
  output: 'standalone',
  // ... rest
};
```

### Railway / Render / Fly.io

Ähnlich wie Vercel:
1. Repository verbinden
2. Environment Variables setzen
3. Build Command: `pnpm build`
4. Start Command: `pnpm start`

---

## Automatisches Deployment (CI/CD)

### GitHub Actions (Optional)

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Environment Variables Checkliste

### Erforderlich ✅

- [x] `DATABASE_URL` - Neon Production Connection String
- [x] `SESSION_SECRET` - Sicherer Random String (32+ Zeichen)
- [x] `APP_URL` - Production URL
- [x] `NODE_ENV=production`

### Google APIs (für volle Funktionalität) 📍

- [ ] `GOOGLE_MAPS_API_KEY` - Maps API Key
- [ ] `GOOGLE_CLIENT_ID` - OAuth Client ID
- [ ] `GOOGLE_CLIENT_SECRET` - OAuth Client Secret
- [ ] `GOOGLE_REDIRECT_URI` - Production Callback URL

### Optional 📧

- [ ] `SMTP_HOST` - SMTP Server
- [ ] `SMTP_PORT` - SMTP Port
- [ ] `SMTP_USER` - SMTP Username
- [ ] `SMTP_PASS` - SMTP Password
- [ ] `SMTP_FROM` - E-Mail Absender

---

## Post-Deployment Checks

### 1. Health Check

```bash
curl https://yourdomain.vercel.app/
# Sollte: 200 OK + HTML zurückgeben
```

### 2. API Routes testen

```bash
# Test Distance Matrix API
curl -X POST https://yourdomain.vercel.app/api/maps/distance-matrix \
  -H "Content-Type: application/json" \
  -d '{"origins":[{"lat":48.1351,"lng":11.582}],"destinations":[{"lat":52.52,"lng":13.405}]}'
```

### 3. Dashboard öffnen

- [https://yourdomain.vercel.app/dashboard](https://yourdomain.vercel.app/dashboard)
- Siehst du das Kanban-Board?

### 4. Mobile App testen

- [https://yourdomain.vercel.app/m/tours](https://yourdomain.vercel.app/m/tours)
- PWA Installation testen (mobil)

### 5. OAuth Flow testen

1. Google Photos verbinden
2. Redirect sollte zurück zum Dashboard gehen
3. Token sollte gespeichert werden

---

## Monitoring & Logs

### Vercel Dashboard

- **Deployments** - Build-Logs
- **Functions** - API Route Logs
- **Analytics** - Traffic & Performance
- **Logs** - Runtime Errors

### Error Tracking (Optional)

**Sentry Integration:**
```bash
pnpm add @sentry/nextjs
```

**sentry.config.ts:**
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Performance Optimierung

### 1. Image Optimization

Next.js optimiert Bilder automatisch. Für externe Bilder:

**next.config.ts:**
```typescript
export default {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google Photos
  },
};
```

### 2. Caching

Vercel cached automatisch:
- Static Assets (public/)
- API Routes (mit Header)
- Server Components

### 3. Edge Functions (Optional)

Für schnellere Responses:

```typescript
export const runtime = 'edge';
```

---

## Rollback bei Problemen

### Vercel Dashboard

1. **Deployments** → Vorheriges Deployment
2. **...** → **Promote to Production**
3. Sofortiger Rollback!

### Via CLI

```bash
vercel rollback
```

---

## Sicherheit

### 1. Environment Secrets

- ✅ NIEMALS `.env` committen
- ✅ Secrets nur über Vercel Dashboard
- ✅ Unterschiedliche Secrets für Dev/Prod

### 2. HTTPS

- ✅ Vercel bietet automatisch HTTPS
- ✅ Certificate Renewal automatisch

### 3. Security Headers

✅ Bereits in `vercel.json` konfiguriert:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## Kosten

### Vercel (Hobby Plan - Kostenlos)

- ✅ 100 GB Bandwidth
- ✅ Unlimited Deployments
- ✅ Unlimited Projects
- ✅ SSL/HTTPS inklusive
- ⚠️ Serverless Functions: 100 GB-Hours/Monat

### Neon (Free Tier)

- ✅ 1 Projekt
- ✅ 3 GB Storage
- ✅ 1 GB RAM

### Google Cloud (Free Tier)

- ✅ Maps API: $200 Guthaben/Monat
- ✅ Photos API: Kostenlos (Read/Write)
- ⚠️ Danach: Pay-as-you-go

---

## Troubleshooting

### Build Fehler

```bash
# Lokal testen
pnpm build

# Logs in Vercel prüfen
# Deployments → Build Logs
```

### Database Connection Error

- ✅ `DATABASE_URL` korrekt?
- ✅ Neon IP-Whitelist (Vercel nutzt viele IPs)
- ✅ `?sslmode=require` im Connection String?

### OAuth Redirect Error

- ✅ Redirect URI in Google Console hinzugefügt?
- ✅ `GOOGLE_REDIRECT_URI` ENV korrekt?
- ✅ HTTPS (nicht HTTP)?

---

## Nächste Schritte

- [ ] Domain verbinden
- [ ] SSL-Certificate prüfen (automatisch)
- [ ] Monitoring einrichten (Sentry)
- [ ] Backups konfigurieren (Neon)
- [ ] E-Mail-Provider testen (SMTP)

---

**Deployment Status:** Bereit für Vercel! 🚀

Folge einfach den Schritten oben und deine App ist in wenigen Minuten live!

