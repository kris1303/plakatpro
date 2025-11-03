# 🚀 PlakatPro

> **Professionelles Kampagnenmanagement für Plakatkampagnen**  
> Next.js · Prisma · PostgreSQL (Neon) · Google Maps & Photos

---

## ✨ Features

- 📊 **Kanban Dashboard** im MeisterTask-Stil
- 🚗 **Mobile Plakatierer-App** (PWA)
- 📸 **GPS-Foto-Upload** zu Google Photos
- 🗺️ **Google Maps Integration** (Distance Matrix, Navigation)
- 📋 **Genehmigungsmanagement** für Kommunen
- 🎯 **Multi-Kampagnen-Support** (bis 100 Stopps pro Tour)
- 📱 **Responsive Design** (Gelb/Schwarz/Weiß)

---

## 🚀 Quick Start

### 1. Installation

```bash
# Dependencies installieren
pnpm install

# Prisma Setup
pnpm prisma:generate
```

### 2. Umgebungsvariablen

Erstelle eine `.env` Datei (siehe `.env.example`):

```env
DATABASE_URL="postgresql://..."
GOOGLE_MAPS_API_KEY="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
# ... weitere Variablen
```

### 3. Datenbank migrieren

```bash
pnpm prisma:migrate
```

### 4. Entwicklungsserver starten

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000)

---

## 📁 Projektstruktur

```
plakatpro/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Kanban Dashboard
│   │   ├── m/tours/            # Mobile Touren-App
│   │   └── api/                # API Routes
│   │       ├── maps/           # Google Maps APIs
│   │       ├── google/photos/  # Google Photos Upload
│   │       └── m/              # Mobile APIs
│   ├── components/
│   │   ├── KanbanBoard.tsx     # Kanban Komponente
│   │   └── Mobile/             # Mobile Komponenten
│   └── lib/
│       ├── prisma.ts           # Prisma Client
│       ├── maps.ts             # Google Maps Helpers
│       ├── photos.ts           # Google Photos Helpers
│       └── utils.ts            # Utilities
├── prisma/
│   └── schema.prisma           # Datenbank Schema
└── public/
```

---

## 🎨 Design System

### Farben
- **Primär:** Gelb `#FFD800`
- **Hintergrund:** Schwarz `#000000`
- **Akzent:** Weiß `#FFFFFF`

### Komponenten
```tsx
// Button Styles
<button className="btn-primary">Primär</button>
<button className="btn-secondary">Sekundär</button>

// Card
<div className="card">...</div>

// Input
<input className="input" />
```

---

## 📊 Datenbank Schema

### Hauptmodelle

- **Campaign** - Kampagnen mit Events
- **Route** - Touren mit Stopps (max. 100)
- **RouteStop** - Einzelne Stopps mit GPS
- **PlanItem** - Kampagnen-Zuordnung zu Stopps
- **Placement** - Einzelne Plakatierungen mit Fotos
- **Photo** - Fotos mit Google Photos Integration
- **Permit** - Genehmigungen von Kommunen
- **City** - Kommunen mit Gebührenmodellen

---

## 🗺️ Google Integration

### Maps APIs

#### Distance Matrix
```typescript
POST /api/maps/distance-matrix
{
  "origins": [{ "placeId": "..." }],
  "destinations": [{ "placeId": "..." }]
}
```

#### Navigation
- Automatische Segmentierung bei >23 Waypoints
- Direkt-Links zu Google Maps Navigation
- GPS-basierte Stopp-Erkennung

### Photos API

#### Upload
```typescript
POST /api/google/photos/upload
FormData:
  - file: File
  - campaignId: string
  - albumId: string
  - planItemId?: string
```

---

## 📱 Mobile App

### Touren-Übersicht
`/m/tours` - Liste aller Touren mit Status

### Tour-Details
`/m/tours/[id]` - Einzelne Tour mit:
- Fortschrittsanzeige
- Navigation-Segmente
- Stopp-Liste mit Plan-Items
- Foto-Upload

### Features
- ✅ Offline-Queue für Uploads
- ✅ EXIF GPS-Extraktion
- ✅ Automatische Zuordnung zu Plan-Items
- ✅ Multi-Kampagnen-Support

---

## 🔧 Verfügbare Scripts

```bash
# Development
pnpm dev              # Dev-Server starten

# Build
pnpm build            # Produktions-Build
pnpm start            # Produktions-Server

# Prisma
pnpm prisma:studio    # Datenbank GUI
pnpm prisma:generate  # Client generieren
pnpm prisma:migrate   # Migration erstellen
pnpm prisma:push      # Schema pushen (dev)

# Linting
pnpm lint             # ESLint ausführen
```

---

## ✅ Neu implementiert

### Fertiggestellte Features

1. ✅ **OAuth 2.0 Flow** für Google Photos (komplett)
2. ✅ **Campaign Status-System** mit Kanban-Mapping
3. ✅ **16 API-Routen** (Google Maps, Photos, Campaigns, Mobile)
4. ✅ **PWA Manifest** für Mobile App
5. ✅ **Token Management** (Access & Refresh)

### Empfohlene Erweiterungen

1. **Session Management** (Next-Auth oder custom)
2. **CSV-Import** für Kommunen & Standorte
3. **PDF-Report Generator** mit Karten & Fotos
4. **E-Mail Templates** (Anträge, Reports)
5. **Routenoptimierung** mit Distance Cache
6. **OCR** für ABM-Fotos (Wettbewerbs-Monitoring)
7. **Service Worker** für Offline-Modus

### Kanban-Board Automationen

- Foto-Upload → Placement Status Update
- Enddatum -2 Tage → "Abhängen - Planung"
- Genehmigung → Task "Gebühr zahlen"
- Tour fertig → Status "Kontrolle"

---

## 🔐 Umgebungsvariablen

### Erforderlich

```env
# Datenbank
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Google Maps
GOOGLE_MAPS_API_KEY="..."

# Google Photos OAuth
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# App
APP_URL="http://localhost:3000"
SESSION_SECRET="random_string_min_32_chars"
```

### Optional

```env
# SMTP (für E-Mails)
SMTP_HOST="smtp.mailbox.org"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="Name <email@domain.de>"
```

---

## 📝 Google Cloud Setup

### APIs aktivieren

1. **Maps Platform**
   - Geocoding API
   - Distance Matrix API
   - Directions API
   - Maps JavaScript API

2. **Google Photos Library API**

### OAuth 2.0 Client

1. Credentials → OAuth 2.0 Client ID erstellen
2. Typ: Web Application
3. Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback`

### Scopes

```
https://www.googleapis.com/auth/photoslibrary.appendonly
```

---

## 🐛 Troubleshooting

### Prisma Client Error
```bash
pnpm prisma:generate
```

### Google Maps 403 Error
- API Key überprüfen
- APIs aktiviert?
- Billing aktiviert?

### Upload fehlschlägt
- Access Token gültig?
- Album ID korrekt?
- Dateigröße <25MB?

---

## 📄 Lizenz

ISC License - Werbeinsel / Kristian Cajic

---

## 🙋 Support

Bei Fragen zur Implementierung:
1. README_PlakatPro.md konsultieren
2. Code-Kommentare lesen
3. Prisma Schema prüfen

---

**Version:** 1.0.0  
**Erstellt:** 03.11.2025  
**Tech Stack:** Next.js 16 · React 19 · Prisma 6 · TypeScript 5 · Tailwind 4

