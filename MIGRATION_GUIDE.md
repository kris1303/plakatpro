# Migration Guide

## Schema-Änderungen durchführen

Nach den Änderungen am Prisma Schema (CampaignStatus hinzugefügt) müssen die Datenbank-Migrationen durchgeführt werden.

### Option 1: Migration erstellen (empfohlen für Produktion)

```bash
pnpm prisma migrate dev --name add-campaign-status
```

Dies erstellt eine neue Migration-Datei und wendet sie an.

### Option 2: Schema direkt pushen (für Development)

```bash
pnpm prisma db push
```

Dies aktualisiert die Datenbank direkt ohne Migration-Datei zu erstellen.

### Nach der Migration

```bash
# Prisma Client neu generieren
pnpm prisma:generate

# Dev-Server neustarten
pnpm dev
```

## Wichtige Änderungen

### 1. Campaign Status-Feld hinzugefügt

Das `Campaign` Model hat jetzt ein `status` Feld vom Typ `CampaignStatus`:

```prisma
enum CampaignStatus {
  backlog
  permits
  print
  planning
  hanging
  control
  removal_plan
  removal_live
  report
  archive
}

model Campaign {
  // ...
  status CampaignStatus @default(backlog)
  // ...
}
```

### 2. OAuth Flow für Google Photos

Neue API-Routen:
- `GET /api/auth/google` - Leitet zu Google OAuth weiter
- `GET /api/auth/google/callback` - OAuth Callback
- `POST /api/auth/google/refresh` - Token refresh
- `GET /api/auth/google/status` - Auth-Status prüfen

### 3. Campaign API-Routen

- `GET /api/campaigns` - Alle Kampagnen abrufen
- `POST /api/campaigns` - Neue Kampagne erstellen
- `PATCH /api/campaigns/[id]/status` - Status aktualisieren

## Bestehende Daten migrieren

Wenn du bereits Kampagnen in der Datenbank hast, werden diese automatisch den Default-Status `backlog` erhalten.

Optional kannst du Kampagnen manuell einem passenden Status zuweisen:

```sql
-- Beispiel: Aktive Kampagnen auf "hanging" setzen
UPDATE "Campaign"
SET status = 'hanging'
WHERE "startDate" <= NOW() AND "endDate" >= NOW();
```

## Troubleshooting

### Migration schlägt fehl

```bash
# Reset der Datenbank (ACHTUNG: Löscht alle Daten!)
pnpm prisma migrate reset

# Oder: Datenbank manuell säubern
pnpm prisma migrate dev --create-only
# Dann: Migration-Datei anpassen und erneut ausführen
pnpm prisma migrate dev
```

### Prisma Client Fehler

```bash
# Client neu generieren
pnpm prisma:generate

# Node modules neu installieren (falls nötig)
rm -rf node_modules
pnpm install
```

