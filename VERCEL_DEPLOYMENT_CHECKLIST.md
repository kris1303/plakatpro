# ✅ Vercel Deployment - Schritt-für-Schritt Checkliste

**Projekt:** PlakatPro  
**Repository:** https://github.com/kris1303/plakatpro  
**Geschätzte Dauer:** 10-15 Minuten

---

## 📋 Vorbereitung (5 Min)

### 1. Neon Production Datenbank erstellen

- [ ] Gehe zu [neon.tech](https://neon.tech)
- [ ] Erstelle ein neues **Production** Projekt (oder Branch)
- [ ] Name: `plakatpro-production`
- [ ] Region: `eu-central-1` (Frankfurt - für bessere Latenz)
- [ ] Kopiere den **Connection String**:
  ```
  postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/plakatpro?sslmode=require
  ```

**Tipp:** Nutze einen separaten Branch oder Projekt für Production!

### 2. Session Secret generieren

- [ ] Generiere einen sicheren Random String (min. 32 Zeichen)

**Online Tool:** [randomkeygen.com](https://randomkeygen.com) → "CodeIgniter Encryption Keys"

**Oder via Terminal:**
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Google OAuth Redirect URI vorbereiten

⚠️ **WICHTIG:** Du musst diese nach dem Deployment aktualisieren!

- [ ] Notiere dir: `https://DEINE-APP.vercel.app/api/auth/google/callback`
- [ ] Nach Deployment: Google Cloud Console → OAuth Client → Authorized redirect URIs hinzufügen

---

## 🚀 Vercel Deployment (5 Min)

### Schritt 1: Vercel Account

- [ ] Gehe zu [vercel.com/signup](https://vercel.com/signup)
- [ ] **Sign up with GitHub**
- [ ] Authorisiere Vercel für deine Repositories

### Schritt 2: Neues Projekt importieren

1. [ ] Klicke **"Add New..."** → **"Project"**
2. [ ] **Import Git Repository**
   - Suche: `plakatpro`
   - Wähle: `kris1303/plakatpro`
3. [ ] Klicke **"Import"**

### Schritt 3: Project Settings

**Framework Preset:**
- [x] Next.js (automatisch erkannt)

**Root Directory:**
- [x] `./` (Standard)

**Build & Development Settings:**
- [x] Build Command: `pnpm build` ✅ (automatisch)
- [x] Output Directory: `.next` ✅ (automatisch)
- [x] Install Command: `pnpm install` ✅ (automatisch)

**Node.js Version:**
- [x] 20.x (empfohlen)

### Schritt 4: Environment Variables ⚠️ WICHTIG!

Klicke **"Environment Variables"** und füge hinzu:

#### Erforderlich (Datenbank)

| Name | Value | Beispiel |
|------|-------|----------|
| `DATABASE_URL` | Neon Connection String | `postgresql://user:pass@ep-xxx.neon.tech/plakatpro?sslmode=require` |
| `SESSION_SECRET` | Generierter Random String | `a1b2c3d4e5f6...` (32+ Zeichen) |
| `APP_URL` | `https://DEINE-APP.vercel.app` | Erst nach Deployment bekannt! |
| `NODE_ENV` | `production` | Genau so! |

**APP_URL Hinweis:** Nutze erst `https://plakatpro.vercel.app` (wird automatisch generiert), später kannst du das aktualisieren.

#### Optional (Google Maps)

| Name | Value |
|------|-------|
| `GOOGLE_MAPS_API_KEY` | Dein Maps API Key |

#### Optional (Google Photos OAuth)

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Dein Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://DEINE-APP.vercel.app/api/auth/google/callback` |

#### Optional (SMTP für E-Mails)

| Name | Value |
|------|-------|
| `SMTP_HOST` | `smtp.mailbox.org` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `info@deine-domain.de` |
| `SMTP_PASS` | Dein Passwort |
| `SMTP_FROM` | `"Werbeinsel <info@deine-domain.de>"` |

### Schritt 5: Deploy!

- [ ] Klicke **"Deploy"**
- [ ] Warte 2-3 Minuten (Vercel baut deine App)
- [ ] Bei Erfolg: 🎉 **"Congratulations"**

---

## 📍 Nach dem Deployment (5 Min)

### 1. App-URL kopieren

- [ ] Vercel zeigt dir: `https://plakatpro-xxx.vercel.app`
- [ ] **Oder:** Custom Domain: `https://DEINE-DOMAIN.vercel.app`
- [ ] Notiere diese URL!

### 2. APP_URL Environment Variable aktualisieren

- [ ] **Vercel Dashboard** → dein Projekt
- [ ] **Settings** → **Environment Variables**
- [ ] Finde `APP_URL`
- [ ] Update zu: `https://plakatpro-xxx.vercel.app`
- [ ] **Redeploy** triggern (Vercel fragt automatisch)

### 3. Google OAuth Redirect URI hinzufügen

**Nur wenn du Google Photos nutzen willst:**

1. [ ] Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. [ ] **APIs & Services** → **Credentials**
3. [ ] Wähle deinen OAuth 2.0 Client
4. [ ] **Authorized redirect URIs** → Hinzufügen:
   ```
   https://plakatpro-xxx.vercel.app/api/auth/google/callback
   ```
5. [ ] **Save**

### 4. Datenbank-Migration ausführen

**Option A: Lokal mit Production DB**

```bash
# In deinem Projekt-Ordner
DATABASE_URL="postgresql://..." pnpm prisma migrate deploy
```

**Option B: Über Vercel CLI** (falls installiert)

```bash
vercel env pull
pnpm prisma migrate deploy
```

**Option C: Erste Nutzung (automatisch)**

Beim ersten API-Call wird Prisma das Schema pushen (falls `prisma db push` in Code).

---

## ✅ Deployment Testen

### 1. Website öffnen

- [ ] Öffne: `https://plakatpro-xxx.vercel.app`
- [ ] Siehst du die Landing Page? ✅
- [ ] Schwarzer Hintergrund mit gelbem Text? ✅

### 2. Dashboard testen

- [ ] Gehe zu: `/dashboard`
- [ ] Siehst du das Kanban-Board? ✅
- [ ] Werden Stats angezeigt (0/0/0)? ✅

### 3. Mobile App testen

- [ ] Gehe zu: `/m/tours`
- [ ] Siehst du "Keine Touren verfügbar"? ✅

### 4. API-Route testen (Optional)

```bash
curl https://plakatpro-xxx.vercel.app/api/campaigns
# Sollte: [] (leeres Array) zurückgeben
```

### 5. PWA Installation testen (Mobil)

- [ ] Öffne die URL auf dem **Smartphone** (Chrome/Safari)
- [ ] **Chrome (Android):** Menü → "Zum Startbildschirm hinzufügen"
- [ ] **Safari (iOS):** Share → "Zum Home-Bildschirm"
- [ ] App sollte im Standalone-Modus öffnen ✅

---

## 🎯 Nächste Schritte

### Sofort

- [ ] Test-Daten über Prisma Studio anlegen:
  ```bash
  DATABASE_URL="postgresql://..." pnpm prisma:studio
  ```

### Später

- [ ] Custom Domain verbinden (Settings → Domains)
- [ ] Monitoring einrichten (Vercel Analytics)
- [ ] Error Tracking (Sentry)

---

## 🐛 Troubleshooting

### Build schlägt fehl

**Fehler:** `Prisma Client not generated`

**Lösung:**
```bash
# Lokal testen
pnpm build

# Sollte funktionieren
```

Vercel generiert Prisma Client automatisch während des Builds.

### Database Connection Error

**Fehler:** `Can't reach database server`

**Prüfe:**
- [ ] `DATABASE_URL` korrekt in Vercel ENV?
- [ ] `?sslmode=require` am Ende der URL?
- [ ] Neon Datenbank läuft (nicht suspended)?

**Neon Tipp:** Free Tier schläft nach Inaktivität (Auto-Wake dauert ~5 Sek)

### OAuth Redirect Error

**Fehler:** `redirect_uri_mismatch`

**Lösung:**
- [ ] Google Cloud Console → Redirect URI hinzugefügt?
- [ ] HTTPS (nicht HTTP)?
- [ ] Exakte URL (keine Tippfehler)?

### 500 Internal Server Error

**Prüfe Vercel Logs:**
1. Vercel Dashboard → dein Projekt
2. **Functions** → Klicke auf die fehlerhafte Route
3. Siehe Error-Details im Log

**Häufige Ursachen:**
- Environment Variable fehlt
- Datenbank nicht erreichbar
- Prisma Client nicht generiert

---

## 📊 Vercel Dashboard Features

### Deployments
- Jeder Git Push = Neues Deployment
- Preview Deployments für Branches
- Rollback mit 1 Klick

### Analytics (Optional - $20/Monat)
- Page Views
- Top Pages
- User Behavior

### Logs
- **Functions** - API Route Logs
- **Build Logs** - Build-Prozess
- **Runtime Logs** - Fehler in Production

### Domains
- Custom Domain verbinden
- Automatisches SSL
- DNS Management

---

## 💰 Kosten-Übersicht

### Vercel Hobby (Kostenlos)
- ✅ Unlimited Websites
- ✅ 100 GB Bandwidth/Monat
- ✅ 100 GB-Hours Serverless Functions/Monat
- ✅ Automatisches SSL/HTTPS
- ✅ Preview Deployments
- ⚠️ Für kommerzielle Nutzung: Pro Plan ($20/Monat)

### Neon Free Tier
- ✅ 1 Projekt (3 mit Community Plan)
- ✅ 3 GB Storage
- ✅ 1 GB RAM
- ⚠️ Auto-Suspend nach Inaktivität

### Google Cloud Free Tier
- ✅ Maps API: $200 Guthaben/Monat
- ✅ Photos API: Unbegrenzt (Read/Write)
- ⚠️ Billing-Account erforderlich

**Geschätzte monatliche Kosten (Low Traffic):** 0€ 🎉

---

## 🎉 Erfolg!

Wenn alles funktioniert:

- ✅ Website ist live auf Vercel
- ✅ HTTPS automatisch aktiviert
- ✅ Datenbank verbunden
- ✅ PWA installierbar
- ✅ Automatisches Deployment bei Git Push

**Deine App ist jetzt Production-Ready! 🚀**

---

**Next Level:**
1. Custom Domain verbinden
2. Google Analytics einbinden
3. Error Tracking (Sentry)
4. Performance Monitoring
5. E-Mail-Benachrichtigungen testen

**Bei Fragen:** Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für Details!

