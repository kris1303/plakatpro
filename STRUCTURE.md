# 📂 PlakatPro - Projektstruktur

## Verzeichnisübersicht

```
plakatpro/
├── prisma/
│   ├── schema.prisma              # Datenbank-Schema (PostgreSQL)
│   └── migrations/                # Datenbank-Migrationen (auto-generiert)
│
├── public/                        # Statische Assets
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root Layout
│   │   ├── page.tsx               # Homepage
│   │   ├── globals.css            # Globale Styles (Tailwind)
│   │   │
│   │   ├── dashboard/             # 📊 Dashboard (Kanban)
│   │   │   └── page.tsx           # Kanban-Board & Statistiken
│   │   │
│   │   ├── m/                     # 📱 Mobile App
│   │   │   └── tours/
│   │   │       ├── page.tsx       # Touren-Liste
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Tour-Details mit Navigation
│   │   │
│   │   └── api/                   # API Routes
│   │       ├── maps/
│   │       │   └── distance-matrix/
│   │       │       └── route.ts   # Google Distance Matrix API
│   │       │
│   │       ├── google/
│   │       │   └── photos/
│   │       │       ├── create-album/
│   │       │       │   └── route.ts  # Album erstellen
│   │       │       └── upload/
│   │       │           └── route.ts  # Foto hochladen
│   │       │
│   │       └── m/                 # Mobile APIs
│   │           ├── tours/
│   │           │   ├── route.ts   # GET/POST Touren
│   │           │   └── [id]/
│   │           │       └── route.ts  # GET/PATCH einzelne Tour
│   │           ├── placements/
│   │           │   └── [id]/
│   │           │       └── check/
│   │           │           └── route.ts  # Placement checken
│   │           └── abm/
│   │               └── route.ts   # Wettbewerbs-Monitoring
│   │
│   ├── components/                # React Komponenten
│   │   ├── KanbanBoard.tsx        # Kanban-Board (Dashboard)
│   │   └── Mobile/
│   │       ├── TourList.tsx       # Touren-Liste
│   │       ├── StopItem.tsx       # Einzelner Stopp
│   │       └── CameraUpload.tsx   # Foto-Upload
│   │
│   └── lib/                       # Utilities & Helpers
│       ├── prisma.ts              # Prisma Client Singleton
│       ├── utils.ts               # Allgemeine Utilities
│       ├── maps.ts                # Google Maps Helpers
│       └── photos.ts              # Google Photos Helpers
│
├── .env.example                   # Template für Umgebungsvariablen
├── .gitignore                     # Git Ignore
├── eslint.config.mjs              # ESLint Config
├── next.config.ts                 # Next.js Config
├── package.json                   # NPM Scripts & Dependencies
├── postcss.config.mjs             # PostCSS Config (Tailwind)
├── prisma.config.ts               # Prisma Config
├── README.md                      # Projekt-Dokumentation
├── SETUP.md                       # Setup-Anleitung
├── STRUCTURE.md                   # Diese Datei
├── tailwind.config.ts             # Tailwind Config (Farben)
└── tsconfig.json                  # TypeScript Config
```

---

## 🗂️ Wichtige Dateien

### Datenbank

#### `prisma/schema.prisma`
**Zweck:** Definiert das komplette Datenbank-Schema

**Hauptmodelle:**
- `Campaign` - Kampagnen
- `Route` - Touren
- `RouteStop` - Stopps mit GPS
- `PlanItem` - Kampagnen-Zuordnung zu Stopps
- `Placement` - Einzelne Plakatierungen
- `Photo` - Fotos (Google Photos)
- `Permit` - Genehmigungen
- `City` - Kommunen
- `Client` - Kunden
- `Installer` - Plakatierer
- `PosterFormat` - Plakatformate (A1, A0, etc.)

---

### Konfiguration

#### `tailwind.config.ts`
**Brand-Farben:**
```typescript
colors: {
  brand: {
    yellow: "#FFD800",
    black: "#000000",
    white: "#FFFFFF",
  }
}
```

#### `next.config.ts`
**Google Photos Domain** für Image Optimization:
```typescript
images: {
  domains: ["lh3.googleusercontent.com"]
}
```

---

### Libraries

#### `src/lib/prisma.ts`
Prisma Client Singleton (verhindert zu viele Connections im Dev-Mode)

#### `src/lib/maps.ts`
**Funktionen:**
- `getDistanceMatrix()` - Entfernungen berechnen
- `geocodeAddress()` - Adresse → GPS
- `createNavigationUrl()` - Google Maps Navigation URL
- `createNavigationSegments()` - Tour in Segmente aufteilen (max. 23 Waypoints)

#### `src/lib/photos.ts`
**Funktionen:**
- `createGooglePhotosAlbum()` - Album erstellen
- `uploadPhotoToGooglePhotos()` - Foto hochladen
- `extractExifGPS()` - GPS aus EXIF extrahieren
- `isNearLocation()` - GPS-Nähe prüfen

#### `src/lib/utils.ts`
**Funktionen:**
- `cn()` - Tailwind Class Merger
- `formatDate()` - Datum formatieren (DE)
- `formatDateTime()` - Datum & Zeit formatieren (DE)
- `calculateCampaignProgress()` - Kampagnen-Fortschritt in %

---

## 🎨 Komponenten-Architektur

### Dashboard Komponenten

#### `<KanbanBoard />`
**Props:**
```typescript
{
  campaigns: Campaign[]
}
```

**Features:**
- 10 vordefinierte Spalten (Backlog → Archiv)
- Drag & Drop (TODO)
- Kampagnen-Karten mit Stats

---

### Mobile Komponenten

#### `<TourList />`
**Props:**
```typescript
{
  tours: Route[]
}
```

**Features:**
- Liste aller Touren
- Status-Filter
- Link zu Tour-Details

#### `<StopItem />`
**Props:**
```typescript
{
  stop: RouteStop;
  index: number;
  onNavigate?: () => void;
}
```

**Features:**
- Fortschrittsbalken
- Plan-Items Übersicht
- Navigation-Button

#### `<CameraUpload />`
**Props:**
```typescript
{
  campaignId: string;
  albumId: string;
  planItemId?: string;
  onUploadSuccess?: (photoId: string) => void;
}
```

**Features:**
- Kamera-Zugriff
- EXIF GPS-Extraktion
- Upload zu Google Photos
- Preview

---

## 📊 API Routes Übersicht

### Maps APIs

#### `POST /api/maps/distance-matrix`
**Zweck:** Entfernungen & Fahrzeiten berechnen

**Body:**
```json
{
  "origins": [{ "placeId": "..." }],
  "destinations": [{ "placeId": "..." }]
}
```

**Response:** Google Distance Matrix Response

---

### Google Photos APIs

#### `POST /api/google/photos/create-album`
**Zweck:** Neues Album erstellen

**Body:**
```json
{
  "title": "Kampagne XYZ",
  "accessToken": "..."
}
```

#### `POST /api/google/photos/upload`
**Zweck:** Foto hochladen

**Body:** FormData
- `file` - Foto
- `albumId` - Google Photos Album ID
- `campaignId` - Kampagnen-ID
- `planItemId` - (optional) Plan-Item ID
- `accessToken` - OAuth Token

---

### Mobile APIs

#### `GET /api/m/tours`
**Zweck:** Liste aller Touren

**Query Params:**
- `installerId` - Filter nach Plakatierer
- `status` - Filter nach Status

#### `GET /api/m/tours/[id]`
**Zweck:** Tour-Details

#### `PATCH /api/m/tours/[id]`
**Zweck:** Tour aktualisieren (z.B. Status)

**Body:**
```json
{
  "status": "in_progress"
}
```

#### `POST /api/m/placements/[id]/check`
**Zweck:** Placement als "checked" markieren

**Body:**
```json
{
  "lat": 48.123,
  "lng": 11.456,
  "photoId": "..."
}
```

#### `POST /api/m/abm`
**Zweck:** Wettbewerbs-Foto hochladen

**Body:** FormData
- `file` - Foto
- `notes` - Notizen
- `lat` / `lng` - GPS

---

## 🎯 Best Practices

### Komponenten
- Server Components wo möglich (Standard in App Router)
- Client Components nur mit `"use client"` Directive
- Props mit TypeScript typisieren

### API Routes
- Immer Error Handling
- Status Codes korrekt setzen (200, 400, 500)
- Input validieren (zod)

### Datenbank
- Prisma Relations nutzen (include)
- Cascade deletes definieren
- Indexes für häufige Queries (TODO)

### Styling
- Tailwind Utility Classes
- Custom Classes in `globals.css`
- Brand-Farben aus Config (`brand-yellow`, etc.)

---

## 🚀 Erweiterungsmöglichkeiten

### Neue Features hinzufügen

1. **Neue Route:**
   ```
   src/app/neue-route/page.tsx
   ```

2. **Neue API:**
   ```
   src/app/api/neue-route/route.ts
   ```

3. **Neue Komponente:**
   ```
   src/components/NeueKomponente.tsx
   ```

4. **Neues Modell:**
   ```prisma
   // In prisma/schema.prisma
   model NeuesModell {
     id String @id @default(cuid())
     // ...
   }
   ```
   
   Dann:
   ```bash
   pnpm prisma:migrate
   ```

---

## 📝 Naming Conventions

### Dateien
- Komponenten: `PascalCase.tsx`
- Routes: `kebab-case/page.tsx`
- Libs: `camelCase.ts`

### Variablen
- React Props: `camelCase`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Datenbank
- Modelle: `PascalCase` (Singular)
- Felder: `camelCase`
- Enums: `PascalCase`

---

Viel Erfolg beim Entwickeln! 🎉

