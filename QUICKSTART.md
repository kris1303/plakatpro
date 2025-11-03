# 🚀 PlakatPro - Quick Start

Schnellstart-Anleitung für die ersten Schritte mit PlakatPro.

---

## 1. Dependencies installiert ✅

```bash
pnpm install
```

**Status:** Bereits erledigt!

---

## 2. Datenbank einrichten

### Neon PostgreSQL erstellen

1. Gehe zu [neon.tech](https://neon.tech)
2. Erstelle ein kostenloses Konto
3. Erstelle ein neues Projekt: **"PlakatPro"**
4. Kopiere den **Connection String** (sollte so aussehen):
   ```
   postgresql://username:password@ep-xxx-xxx.eu-central-1.aws.neon.tech/plakatpro?sslmode=require
   ```

### .env Datei erstellen

Erstelle eine `.env` Datei im Projektroot:

```bash
# Windows (PowerShell)
New-Item .env

# macOS/Linux
touch .env
```

Füge folgendes ein (ersetze die Platzhalter):

```env
# Datenbank (von Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/plakatpro?sslmode=require"

# Google Maps (später)
GOOGLE_MAPS_API_KEY="your_key_here"

# Google Photos OAuth (später)
GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_secret_here"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# App
APP_URL="http://localhost:3000"
SESSION_SECRET="wähle_einen_sehr_langen_zufälligen_string_mindestens_32_zeichen"
NODE_ENV="development"
```

---

## 3. Datenbank migrieren

```bash
# Prisma Client generieren (bereits erledigt ✅)
pnpm prisma:generate

# Migration ausführen (fügt CampaignStatus hinzu)
pnpm prisma migrate dev --name add-campaign-status

# Optional: Prisma Studio öffnen (Datenbank-GUI)
pnpm prisma:studio
```

---

## 4. Dev-Server starten

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000)

Du solltest jetzt die Landing Page sehen! 🎉

---

## 5. Google Cloud Setup (Optional, für volle Funktionalität)

### Google Maps API

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Erstelle ein neues Projekt: **"PlakatPro"**
3. **APIs aktivieren:**
   - Geocoding API
   - Distance Matrix API
   - Directions API
   - Maps JavaScript API
4. **API Key erstellen:**
   - APIs & Services → Credentials
   - Create Credentials → API Key
   - Kopiere den Key in `.env` als `GOOGLE_MAPS_API_KEY`

### Google Photos OAuth

1. Im selben Google Cloud Projekt:
2. **APIs aktivieren:**
   - Google Photos Library API
3. **OAuth Consent Screen:**
   - User Type: External
   - App name: PlakatPro
   - Support email: deine E-Mail
   - Developer contact: deine E-Mail
   - Scopes hinzufügen:
     - `https://www.googleapis.com/auth/photoslibrary.appendonly`
   - Test users: deine E-Mail hinzufügen
4. **OAuth 2.0 Client erstellen:**
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: PlakatPro Web
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
   - Kopiere Client ID und Secret in `.env`

---

## 6. Test-Daten anlegen

### Prisma Studio nutzen

```bash
pnpm prisma:studio
```

Öffnet GUI auf [http://localhost:5555](http://localhost:5555)

### Manuell Test-Daten erstellen:

#### 1. Client erstellen
```
Model: Client
- name: "Test Kunde GmbH"
- email: "kunde@test.de"
```

#### 2. PosterFormat erstellen
```
Model: PosterFormat
- name: "A1"
- widthMm: 594
- heightMm: 841
```

#### 3. City erstellen
```
Model: City
- name: "München"
- email: "plakate@muenchen.de"
- feeModel: "proPlakat"
- fee: 25.00
```

#### 4. Campaign erstellen
```
Model: Campaign
- title: "Sommerfest 2025"
- eventName: "Großes Stadtfest"
- startDate: 2025-06-01
- endDate: 2025-06-30
- status: backlog
- clientId: [ID vom Client]
```

#### 5. Installer erstellen
```
Model: Installer
- name: "Max Mustermann"
- phone: "+49 123 456789"
```

---

## 7. Features testen

### Dashboard öffnen

[http://localhost:3000/dashboard](http://localhost:3000/dashboard)

- Siehst du deine Test-Kampagne im Kanban-Board?
- Werden die Stats angezeigt?

### Mobile App öffnen

[http://localhost:3000/m/tours](http://localhost:3000/m/tours)

- Noch keine Touren? Normal! Erstelle eine über Prisma Studio.

### Google Photos verbinden

1. Auf dem Dashboard: "Mit Google Photos verbinden"
2. Google OAuth Flow durchlaufen
3. Nach Redirect sollte Status "✓ Google Photos verbunden" anzeigen

---

## 🐛 Troubleshooting

### Prisma Client Error
```bash
pnpm prisma:generate
```

### Migration Error
```bash
# Datenbank zurücksetzen (ACHTUNG: löscht Daten!)
pnpm prisma migrate reset
```

### Port 3000 bereits belegt
```bash
# Server auf anderem Port starten
PORT=3001 pnpm dev
```

### Google Maps 403 Error
- API Key korrekt in `.env`?
- APIs in Google Cloud aktiviert?
- Billing aktiviert? (kostenlos bis zu Limit)

---

## ✅ Checkliste

- [ ] Dependencies installiert
- [ ] Neon Datenbank erstellt
- [ ] `.env` Datei ausgefüllt
- [ ] Migration ausgeführt
- [ ] Dev-Server läuft
- [ ] Landing Page sichtbar
- [ ] Dashboard erreichbar
- [ ] Test-Daten angelegt
- [ ] Google Maps API Key (optional)
- [ ] Google Photos OAuth (optional)

---

## 🎯 Nächste Schritte

1. **Mehr Kampagnen erstellen**
2. **Touren mit Stopps anlegen**
3. **Mobile App testen**
4. **Foto-Upload testen** (mit Google Photos OAuth)

---

**Viel Erfolg! 🚀**

Bei Problemen: siehe `SETUP.md` für Details oder `IMPLEMENTATION_STATUS.md` für den aktuellen Stand.

