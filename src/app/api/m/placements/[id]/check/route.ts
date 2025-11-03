import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST: Placement als "checked" markieren
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { lat, lng, photoId } = await req.json();

    const placement = await prisma.placement.update({
      where: { id },
      data: {
        status: "checked",
        lat,
        lng,
        photoId,
        takenAt: new Date(),
      },
    });

    return NextResponse.json(placement);
  } catch (error) {
    console.error("Check placement error:", error);
    return NextResponse.json(
      { error: "Failed to check placement" },
      { status: 500 }
    );
  }
}

