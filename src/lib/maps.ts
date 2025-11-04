import { Client, DistanceMatrixResponse } from "@googlemaps/google-maps-services-js";

const client = new Client({});

/**
 * Berechnet Entfernungen und Fahrzeiten zwischen Orten
 */
export async function getDistanceMatrix(
  origins: Array<{ placeId: string } | { lat: number; lng: number }>,
  destinations: Array<{ placeId: string } | { lat: number; lng: number }>
): Promise<DistanceMatrixResponse> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY ist nicht gesetzt");
  }

  const formattedOrigins = origins.map((origin) =>
    "placeId" in origin
      ? { place_id: origin.placeId }
      : `${origin.lat},${origin.lng}`
  );

  const formattedDestinations = destinations.map((dest) =>
    "placeId" in dest
      ? { place_id: dest.placeId }
      : `${dest.lat},${dest.lng}`
  );

  const response = await client.distancematrix({
    params: {
      key: apiKey,
      origins: formattedOrigins as any,
      destinations: formattedDestinations as any,
      units: "metric" as any,
      language: "de",
    },
  });

  return response;
}

/**
 * Geocoding: Adresse zu Koordinaten
 */
export async function geocodeAddress(address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY ist nicht gesetzt");
  }

  const response = await client.geocode({
    params: {
      key: apiKey,
      address,
      language: "de",
    },
  });

  return response.data.results[0];
}

/**
 * Erstellt Google Maps Navigation URL mit Waypoints
 * Limitiert auf 23 Waypoints (Google Limit ist 25, wir lassen Puffer)
 */
export function createNavigationUrl(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: Array<{ lat: number; lng: number }> = []
): string {
  const waypointsParam =
    waypoints.length > 0
      ? waypoints
          .slice(0, 23)
          .map((wp) => `${wp.lat},${wp.lng}`)
          .join("|")
      : "";

  const baseUrl = "https://www.google.com/maps/dir/?api=1";
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });

  if (waypointsParam) {
    params.append("waypoints", waypointsParam);
  }

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Teilt eine Tour in Segmente à max. 23 Waypoints auf
 */
export function createNavigationSegments(
  stops: Array<{ lat: number; lng: number }>
): Array<{
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number }>;
}> {
  if (stops.length < 2) return [];

  const segments = [];
  const WAYPOINT_LIMIT = 23;

  for (let i = 0; i < stops.length - 1; i += WAYPOINT_LIMIT + 1) {
    const segmentStops = stops.slice(i, i + WAYPOINT_LIMIT + 2);
    const origin = segmentStops[0];
    const destination = segmentStops[segmentStops.length - 1];
    const waypoints = segmentStops.slice(1, -1);

    segments.push({ origin, destination, waypoints });
  }

  return segments;
}

/**
 * Berechnet die Entfernung zwischen zwei Adressen
 */
export async function calculateDistance(origin: string, destination: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API Key fehlt");

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(destination)}&units=metric&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Google Maps API Error: ${data.status}`);
  }

  const element = data.rows[0].elements[0];
  if (element.status !== "OK") {
    throw new Error(`Route nicht gefunden: ${element.status}`);
  }

  return {
    distance: element.distance.value, // in Metern
    duration: element.duration.value, // in Sekunden
    distanceText: element.distance.text,
    durationText: element.duration.text,
    distanceKm: Math.round(element.distance.value / 100) / 10, // in km (auf 0.1 gerundet)
  };
}

