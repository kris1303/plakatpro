import { NextResponse } from "next/server";
import { calculateDistance } from "@/lib/maps";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin und Destination erforderlich" },
        { status: 400 }
      );
    }

    const result = await calculateDistance(origin, destination);

    return NextResponse.json({
      distanceKm: result.distanceKm,
      distanceText: result.distanceText,
      durationText: result.durationText,
    });
  } catch (error) {
    console.error("Fehler bei Entfernungsberechnung:", error);
    return NextResponse.json(
      { error: "Fehler bei der Entfernungsberechnung" },
      { status: 500 }
    );
  }
}

