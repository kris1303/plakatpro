# 🚀 PlakatPro Setup-Anleitung

## Schritt-für-Schritt Installation

### 1. ✅ Dependencies installiert

```bash
pnpm install
```

Status: **Abgeschlossen** ✅

---

### 2. 📋 .env Datei erstellen

Erstelle eine `.env` Datei im Projektroot:

```bash
# Im Projektverzeichnis
cp .env.example .env
```

Oder erstelle manuell eine `.env` Datei mit folgendem Inhalt:

```env
# Datenbank
DATABASE_URL="postgresql://user:pass@neonhost/db?sslmode=require"

# SMTP
SMTP_HOST="smtp.mailbox.org"
SMTP_PORT="587"
SMTP_USER="info@deine-domain.de"
SMTP_PASS="***"
SMTP_FROM="Werbeinsel <info@deine-domain.de>"

# Google Maps
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Google Photos OAuth
GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# App
APP_URL="http://localhost:3000"
SESSION_SECRET="change_me_to_a_random_string_min_32_chars"
```

---

### 3. 🗄️ Neon PostgreSQL Datenbank einrichten

1. Gehe zu [neon.tech](https://neon.tech)
2. Erstelle ein neues Projekt
3. Erstelle eine neue PostgreSQL Datenbank
4. Kopiere den **Connection String** (psql oder pooled)
5. Füge ihn in `.env` als `DATABASE_URL` ein

**Beispiel:**
```env
DATABASE_URL="postgresql://username:password@ep-cool-name-123456.eu-central-1.aws.neon.tech/plakatpro?sslmode=require"
```

---

### 4. 🔧 Prisma Setup

```bash
# Prisma Client generieren
pnpm prisma:generate

# Datenbank-Migrationen ausführen
pnpm prisma:migrate

# Optional: Prisma Studio öffnen (Datenbank GUI)
pnpm prisma:studio
```

---

### 5. 🌐 Google Cloud APIs einrichten

#### A) Neues Projekt erstellen

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Erstelle ein neues Projekt (z.B. "PlakatPro")

#### B) APIs aktivieren

Aktiviere folgende APIs im Projekt:

**Maps Platform:**
- ✅ Geocoding API
- ✅ Distance Matrix API
- ✅ Directions API
- ✅ Maps JavaScript API

**Photos:**
- ✅ Google Photos Library API

#### C) API Key erstellen (für Maps)

1. APIs & Services → Credentials
2. Create Credentials → API Key
3. Beschränke den Key (optional aber empfohlen):
   - Application restrictions: HTTP referrers oder IP addresses
   - API restrictions: Nur die oben genannten Maps APIs
4. Kopiere den Key in `.env` als `GOOGLE_MAPS_API_KEY`

#### D) OAuth 2.0 Client erstellen (für Photos)

1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Configure Consent Screen (falls noch nicht gemacht):
   - User Type: External
   - Testbenutzer: Deine E-Mail-Adresse hinzufügen
   - Scopes: `https://www.googleapis.com/auth/photoslibrary.appendonly`
4. Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - (später auch Production URL hinzufügen)
5. Kopiere Client ID und Client Secret in `.env`

---

### 6. 📧 SMTP Setup (Optional)

Für E-Mail-Benachrichtigungen (Anträge, Reports):

**Empfehlung: mailbox.org**

```env
SMTP_HOST="smtp.mailbox.org"
SMTP_PORT="587"
SMTP_USER="deine@email.de"
SMTP_PASS="dein-passwort"
SMTP_FROM="Werbeinsel <deine@email.de>"
```

**Alternativen:**
- Gmail (mit App-Password)
- SendGrid
- Mailgun
- AWS SES

---

### 7. 🚀 Entwicklungsserver starten

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## ✅ Checkliste

- [ ] Dependencies installiert (`pnpm install`)
- [ ] `.env` Datei erstellt
- [ ] Neon Datenbank erstellt und `DATABASE_URL` eingetragen
- [ ] `pnpm prisma:generate` ausgeführt
- [ ] `pnpm prisma:migrate` ausgeführt (oder `pnpm prisma:push` für Dev)
- [ ] Google Maps API Key erstellt und eingetragen
- [ ] Google Photos OAuth Client erstellt und eingetragen
- [ ] SMTP Credentials eingetragen (optional)
- [ ] `pnpm dev` gestartet
- [ ] [http://localhost:3000](http://localhost:3000) funktioniert

---

## 🎉 Nächste Schritte

Wenn alles funktioniert:

1. **Test-Daten anlegen**
   - Über Prisma Studio: `pnpm prisma:studio`
   - Oder über API Routes

2. **Kampagne erstellen**
   - Gehe zum Dashboard
   - Erstelle eine Test-Kampagne

3. **Tour anlegen**
   - Mobile App öffnen (`/m/tours`)
   - Neue Tour mit Stopps anlegen

4. **Foto-Upload testen**
   - Tour-Details öffnen
   - Foto mit GPS-Daten hochladen

---

## 🐛 Troubleshooting

### Prisma Client Error

```bash
pnpm prisma:generate
```

### Migration Error

```bash
# Für Development: Push Schema direkt
pnpm prisma:push

# Oder: Migration zurücksetzen
pnpm prisma migrate reset
```

### Google Maps 403 Error

- ✅ API Key korrekt?
- ✅ APIs aktiviert?
- ✅ Billing aktiviert? (Kostenlos bis zu bestimmtem Limit)
- ✅ API Restrictions richtig gesetzt?

### Google Photos Upload Error

- ✅ OAuth Client ID/Secret korrekt?
- ✅ Redirect URI stimmt überein?
- ✅ Testbenutzer hinzugefügt (im OAuth Consent Screen)?
- ✅ Access Token gültig?

---

## 📚 Weitere Ressourcen

- [Next.js Dokumentation](https://nextjs.org/docs)
- [Prisma Dokumentation](https://www.prisma.io/docs)
- [Google Maps Platform](https://developers.google.com/maps)
- [Google Photos API](https://developers.google.com/photos)
- [Neon PostgreSQL](https://neon.tech/docs)

---

Viel Erfolg! 🎉

