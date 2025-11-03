/**
 * Google Photos API Integration
 */

interface GooglePhotosConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken: string;
}

/**
 * Erstellt ein neues Album in Google Photos
 */
export async function createGooglePhotosAlbum(
  title: string,
  accessToken: string
): Promise<{ id: string; productUrl: string; shareableUrl: string }> {
  const response = await fetch("https://photoslibrary.googleapis.com/v1/albums", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      album: { title },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create album: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Lädt ein Foto zu Google Photos hoch
 * Zwei-Schritt-Prozess: 1) Upload-Token, 2) MediaItem erstellen
 */
export async function uploadPhotoToGooglePhotos(
  fileBuffer: Buffer,
  fileName: string,
  albumId: string,
  accessToken: string
): Promise<string> {
  // Schritt 1: Upload-Token holen
  const uploadResponse = await fetch(
    "https://photoslibrary.googleapis.com/v1/uploads",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        Authorization: `Bearer ${accessToken}`,
        "X-Goog-Upload-File-Name": fileName,
        "X-Goog-Upload-Protocol": "raw",
      },
      body: fileBuffer,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  const uploadToken = await uploadResponse.text();

  // Schritt 2: MediaItem im Album erstellen
  const createResponse = await fetch(
    "https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        albumId,
        newMediaItems: [
          {
            description: fileName,
            simpleMediaItem: {
              uploadToken,
            },
          },
        ],
      }),
    }
  );

  if (!createResponse.ok) {
    throw new Error(`Create media item failed: ${createResponse.statusText}`);
  }

  const data = await createResponse.json();
  return data.newMediaItemResults[0].mediaItem.id;
}

/**
 * Extrahiert GPS-Daten aus EXIF
 */
export async function extractExifGPS(
  file: File
): Promise<{ lat: number; lng: number; timestamp?: Date } | null> {
  try {
    const exifr = await import("exifr");
    const gps = await exifr.gps(file);
    const exif = await exifr.parse(file, ["DateTimeOriginal"]);

    if (!gps) return null;

    return {
      lat: gps.latitude,
      lng: gps.longitude,
      timestamp: exif?.DateTimeOriginal,
    };
  } catch (error) {
    console.error("EXIF extraction failed:", error);
    return null;
  }
}

/**
 * Prüft, ob GPS-Koordinaten in der Nähe einer Position sind
 */
export function isNearLocation(
  photoGPS: { lat: number; lng: number },
  targetGPS: { lat: number; lng: number },
  toleranceMeters: number = 100
): boolean {
  const distance = calculateDistance(
    photoGPS.lat,
    photoGPS.lng,
    targetGPS.lat,
    targetGPS.lng
  );
  return distance <= toleranceMeters;
}

/**
 * Haversine-Formel zur Distanzberechnung
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Erdradius in Metern
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

