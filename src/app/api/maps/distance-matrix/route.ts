import { NextRequest, NextResponse } from "next/server";
import { getDistanceMatrix } from "@/lib/maps";

export async function POST(req: NextRequest) {
  try {
    const { origins, destinations } = await req.json();

    if (!origins || !destinations) {
      return NextResponse.json(
        { error: "Origins and destinations are required" },
        { status: 400 }
      );
    }

    const response = await getDistanceMatrix(origins, destinations);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Distance Matrix API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate distances" },
      { status: 500 }
    );
  }
}

