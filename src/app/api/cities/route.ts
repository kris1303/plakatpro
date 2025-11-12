import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Alle Kommunen abrufen
 */
export async function GET(req: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      include: {
        permitFormAsset: true,
      },
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Get cities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neue Kommune erstellen
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      name,
      email,
      feeModel,
      fee,
      maxQty,
      maxSize,
      placeId,
      lat,
      lng,
      requiresPermitForm,
      requiresPosterImage,
      permitFormAssetId,
    } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const city = await prisma.city.create({
      data: {
        name,
        email,
        feeModel,
        fee,
        maxQty,
        maxSize,
        placeId,
        lat,
        lng,
        requiresPermitForm: !!requiresPermitForm,
        requiresPosterImage: !!requiresPosterImage,
        permitFormAssetId: permitFormAssetId || null,
      },
      include: {
        permitFormAsset: true,
      },
    });

    return NextResponse.json(city);
  } catch (error) {
    console.error("Create city error:", error);
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}

