# PWA Setup für PlakatPro Mobile App

## Übersicht

PlakatPro kann als Progressive Web App (PWA) installiert werden, besonders nützlich für die Mobile Plakatierer-App.

---

## Was bereits implementiert ist

### 1. Manifest (manifest.json)

Datei: `public/manifest.json`

Features:
- ✅ App-Name & Beschreibung
- ✅ Icons (192x192, 512x512)
- ✅ Standalone Display Mode
- ✅ Theme Color (Gelb #FFD800)
- ✅ Background Color (Schwarz)
- ✅ Shortcuts (Touren, Dashboard)
- ✅ Start URL (`/m/tours`)

### 2. Metadata in Layout

Datei: `src/app/layout.tsx`

Features:
- ✅ Manifest-Link
- ✅ Theme Color
- ✅ Viewport Settings
- ✅ Apple Web App Meta Tags

---

## Was noch fehlt (Optional)

### Service Worker (für Offline-Funktionalität)

#### Option 1: next-pwa

```bash
pnpm add next-pwa
```

**next.config.ts:**
```typescript
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

export default config;
```

#### Option 2: Manuell

**public/sw.js:**
```javascript
const CACHE_NAME = 'plakatpro-v1';
const urlsToCache = [
  '/',
  '/m/tours',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**Service Worker registrieren (in src/app/layout.tsx):**
```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

---

## Icons erstellen

### Erforderliche Größen

- 192x192 px (`public/icon-192.png`)
- 512x512 px (`public/icon-512.png`)
- 180x180 px (`public/apple-touch-icon.png`) für iOS

### Design-Vorlage

**Hintergrund:** Schwarz (#000000)  
**Logo:** Gelb (#FFD800)  
**Icon:** Plakat-Symbol oder "PP" Monogramm

### Tools zum Erstellen

- [Favicon.io](https://favicon.io) - Favicon & App Icons
- [RealFaviconGenerator](https://realfavicongenerator.net) - Alle Plattformen
- Figma/Sketch - Eigenes Design

### Quick & Dirty (Placeholder)

```bash
# Erstelle einfache Placeholder-Icons mit ImageMagick
convert -size 192x192 xc:#000000 -fill "#FFD800" -pointsize 100 -gravity center -annotate +0+0 "PP" public/icon-192.png
convert -size 512x512 xc:#000000 -fill "#FFD800" -pointsize 300 -gravity center -annotate +0+0 "PP" public/icon-512.png
```

---

## Installation testen

### Desktop (Chrome/Edge)

1. Öffne [http://localhost:3000](http://localhost:3000)
2. Adressleiste → "App installieren" Icon
3. Klicke "Installieren"

### Mobile (Android)

1. Öffne URL in Chrome
2. Menü (⋮) → "Zum Startbildschirm hinzufügen"
3. App öffnet sich im Standalone Mode

### Mobile (iOS/Safari)

1. Öffne URL in Safari
2. Share-Button → "Zum Home-Bildschirm"
3. App wird installiert

**Hinweis:** iOS unterstützt keine echten Service Worker für PWAs, daher limitierte Offline-Funktionalität.

---

## Offline-Strategie (für Service Worker)

### Cache-First Strategie

**Für statische Assets:**
- HTML, CSS, JS
- Icons, Fonts
- Bilder

**Beispiel:**
```javascript
// Cache-First: Schnell, aber kann veraltet sein
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});
```

### Network-First Strategie

**Für API-Requests:**
- `/api/m/tours`
- `/api/campaigns`
- Etc.

**Beispiel:**
```javascript
// Network-First: Immer aktuell, Fallback auf Cache
if (event.request.url.includes('/api/')) {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
}
```

### Background Sync (für Foto-Uploads)

**Mit Workbox:**
```javascript
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const bgSyncPlugin = new BackgroundSyncPlugin('photo-upload-queue', {
  maxRetentionTime: 24 * 60 // 24 Stunden
});
```

---

## Push-Benachrichtigungen (Optional)

### Setup

1. **VAPID Keys generieren:**
```bash
npx web-push generate-vapid-keys
```

2. **Subscription in Service Worker:**
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
  });
});
```

3. **API-Route zum Senden:**
```typescript
// src/app/api/notifications/send/route.ts
import webpush from 'web-push';

export async function POST(req: Request) {
  const { subscription, payload } = await req.json();
  
  webpush.setVapidDetails(
    'mailto:info@plakatpro.de',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  await webpush.sendNotification(subscription, JSON.stringify(payload));
  return Response.json({ success: true });
}
```

**Use Cases:**
- Tour startet in 1 Stunde
- Neue Genehmigung verfügbar
- Foto-Upload fehlgeschlagen (Retry)

---

## Testing

### Lighthouse PWA Audit

```bash
# Chrome DevTools → Lighthouse → PWA
```

**Kriterien:**
- ✅ Manifest
- ✅ Icons
- ✅ Theme Color
- 🚧 Service Worker (optional)
- 🚧 Offline-Funktionalität (optional)

### PWA Install Prompt testen

```bash
# Chrome DevTools → Application → Manifest
# Klicke "Add to home screen" zum Testen
```

---

## Production Deployment

### Vercel

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### HTTPS erforderlich

- PWAs benötigen HTTPS (oder localhost)
- Vercel bietet automatisch HTTPS

---

## Nächste Schritte

1. **Icons erstellen** (`icon-192.png`, `icon-512.png`)
2. **Service Worker** implementieren (optional, für Offline)
3. **Background Sync** für Foto-Uploads (optional)
4. **Push Notifications** (optional)
5. **Lighthouse Audit** durchführen

---

**Status:** Basis implementiert ✅  
**Offline-Modus:** Optional 🚧  
**Push Notifications:** Optional 🚧

