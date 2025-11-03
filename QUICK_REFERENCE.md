# ⚡ PlakatPro - Quick Reference

## 🚀 Wichtigste Commands

```bash
# Development starten
pnpm dev

# Prisma Studio (Datenbank GUI)
pnpm prisma:studio

# Prisma Client neu generieren (nach Schema-Änderungen)
pnpm prisma:generate

# Migration erstellen
pnpm prisma:migrate

# Schema direkt pushen (Development)
pnpm prisma:push

# Build für Production
pnpm build

# Production Server
pnpm start

# Linting
pnpm lint
```

---

## 📍 Wichtige URLs

```
Homepage:              http://localhost:3000
Dashboard (Kanban):    http://localhost:3000/dashboard
Mobile Touren:         http://localhost:3000/m/tours
Prisma Studio:         http://localhost:5555 (nach pnpm prisma:studio)
```

---

## 🎨 CSS Classes (Tailwind)

### Buttons
```tsx
<button className="btn-primary">Primär</button>
<button className="btn-secondary">Sekundär</button>
```

### Cards
```tsx
<div className="card">
  {/* Content */}
</div>
```

### Inputs
```tsx
<input className="input" />
```

### Brand Colors
```tsx
<div className="bg-brand-yellow text-brand-black">Gelb</div>
<div className="bg-brand-black text-brand-white">Schwarz</div>
```

---

## 📊 Datenbank Models (Prisma)

### Wichtigste Relationen

```
Client 1:n Campaign
Campaign 1:n Permit
Campaign 1:n Route
Campaign 1:n Photo
Campaign 1:n PlanItem
Route 1:n RouteStop
RouteStop 1:n PlanItem
PlanItem 1:n Placement
Placement 1:1 Photo
City 1:n Permit
City 1:n RouteStop
Installer 1:n Route
PosterFormat 1:n PlanItem
```

### Enums

```typescript
PermitStatus: requested | info_needed | approved | approved_with_conditions | rejected
RouteStatus: planned | in_progress | done
PlacementStatus: planned | hung | checked | removed
```

---

## 🔧 Häufige Tasks

### 1. Neue Kampagne erstellen

```typescript
const campaign = await prisma.campaign.create({
  data: {
    title: "Frühlingskonzert 2025",
    eventName: "Frühlingskonzert",
    locationName: "Stadtpark",
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-04-15"),
    clientId: "...",
  }
});
```

### 2. Tour mit Stopps erstellen

```typescript
const route = await prisma.route.create({
  data: {
    plannedDate: new Date("2025-04-01"),
    installerId: "...",
    campaignId: "...",
    status: "planned",
    stops: {
      create: [
        {
          seq: 0,
          cityId: "...",
          lat: 48.1351,
          lng: 11.5820,
          planItems: {
            create: [
              {
                campaignId: "...",
                formatId: "...",
                plannedQty: 5,
                remainingQty: 5,
              }
            ]
          }
        }
      ]
    }
  },
  include: { stops: true }
});
```

### 3. Foto hochladen (Client-side)

```typescript
const formData = new FormData();
formData.append("file", file);
formData.append("campaignId", campaignId);
formData.append("albumId", albumId);
formData.append("planItemId", planItemId);
formData.append("accessToken", accessToken);

const response = await fetch("/api/google/photos/upload", {
  method: "POST",
  body: formData,
});
```

### 4. Distance Matrix abrufen

```typescript
const response = await fetch("/api/maps/distance-matrix", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    origins: [{ placeId: "ChIJ..." }],
    destinations: [{ placeId: "ChIJ..." }],
  }),
});
```

---

## 🗺️ Google Maps Navigation

### Einzelner Stopp
```typescript
const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
window.open(url, "_blank");
```

### Mit Waypoints
```typescript
import { createNavigationUrl } from "@/lib/maps";

const url = createNavigationUrl(
  { lat: 48.1, lng: 11.5 },     // Origin
  { lat: 48.2, lng: 11.6 },     // Destination
  [{ lat: 48.15, lng: 11.55 }]  // Waypoints (max. 23)
);
```

### Tour in Segmente aufteilen
```typescript
import { createNavigationSegments } from "@/lib/maps";

const stops = [
  { lat: 48.1, lng: 11.5 },
  { lat: 48.2, lng: 11.6 },
  // ... bis zu 100 Stopps
];

const segments = createNavigationSegments(stops);
// Ergebnis: Array von Segmenten mit max. 23 Waypoints
```

---

## 📸 Foto-Upload Flow

### 1. EXIF GPS extrahieren
```typescript
import { extractExifGPS } from "@/lib/photos";

const gps = await extractExifGPS(file);
// { lat: 48.123, lng: 11.456, timestamp: Date }
```

### 2. Album erstellen (einmalig pro Kampagne)
```typescript
const response = await fetch("/api/google/photos/create-album", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Kampagne XYZ",
    accessToken: token,
  }),
});

const album = await response.json();
// { id: "...", productUrl: "...", shareableUrl: "..." }
```

### 3. Foto hochladen
```typescript
// Siehe "3. Foto hochladen" oben
```

---

## 🔐 Umgebungsvariablen

### Erforderlich
```env
DATABASE_URL          # Neon PostgreSQL Connection String
GOOGLE_MAPS_API_KEY   # Google Maps API Key
GOOGLE_CLIENT_ID      # OAuth Client ID
GOOGLE_CLIENT_SECRET  # OAuth Client Secret
```

### Optional
```env
SMTP_HOST             # SMTP Server
SMTP_PORT             # SMTP Port (587)
SMTP_USER             # SMTP Username
SMTP_PASS             # SMTP Password
SMTP_FROM             # From Address
SESSION_SECRET        # Session Encryption Key
```

---

## 🎯 Kanban-Board Spalten

1. **Backlog/Setup** - Neue Kampagnen
2. **Genehmigungen** - Anträge bei Kommunen
3. **Druck/Material** - Plakatproduktion
4. **Tourplanung** - Routen & Stopps festlegen
5. **Aushang** - Aktiv beim Plakatieren
6. **Kontrolle** - Nachkontrolle
7. **Abhängen - Planung** - Abbau vorbereiten
8. **Abhängen - Live** - Aktiv beim Abhängen
9. **Report** - Berichte erstellen
10. **Archiv** - Abgeschlossen

---

## 📱 Mobile App Features

### Tour-Liste (`/m/tours`)
- Filter nach Status (planned, in_progress, done)
- Übersicht aller Touren
- Schnellzugriff zu Tour-Details

### Tour-Details (`/m/tours/[id]`)
- Gesamt-Fortschritt
- Navigation-Segmente (bei >23 Stopps)
- Stopp-Liste mit Plan-Items
- Foto-Upload Button (FAB)

### Stop-Item Komponente
- Fortschrittsbalken pro Stopp
- Plan-Items Übersicht (Multi-Kampagnen)
- Navigation-Button zu Google Maps

### Camera-Upload
- Native Kamera-Zugriff
- EXIF GPS-Extraktion
- Preview vor Upload
- Automatische Zuordnung zu Plan-Item

---

## 🐛 Debugging

### Prisma Studio öffnen
```bash
pnpm prisma:studio
```

### Console Logs ansehen
```bash
# Terminal wo pnpm dev läuft
```

### Datenbank zurücksetzen
```bash
pnpm prisma migrate reset
# ACHTUNG: Löscht alle Daten!
```

### Prisma Client neu generieren
```bash
pnpm prisma:generate
```

---

## 🔗 Wichtige Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)
- [Google Photos API](https://developers.google.com/photos)
- [Neon Docs](https://neon.tech/docs)

---

## 💡 Tipps

### Performance
- Server Components wo möglich (kein "use client")
- Images mit next/image optimieren
- API Responses cachen (React Cache)

### Development
- Hot Reload bei Code-Änderungen
- Prisma Studio für schnelle DB-Checks
- Browser DevTools für Network-Debugging

### Production
- Environment Variablen in Vercel/Hosting setzen
- Domain zu Google OAuth Redirect URIs hinzufügen
- Google Maps API Key beschränken (Domain/IP)

---

Viel Erfolg! 🎉

