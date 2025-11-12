import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Einzelne Kommune abrufen
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        permitFormAsset: true,
      },
    });

    if (!city) {
      return NextResponse.json(
        { error: "Kommune nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(city);
  } catch (error) {
    console.error("Get city error:", error);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Kommune aktualisieren
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const {
      name,
      postalCode,
      email,
      feeModel,
      fee,
      maxQty,
      maxSize,
      requiresPermitForm,
      permitFormAssetId,
    } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const city = await prisma.city.update({
      where: { id },
      data: {
        name,
        postalCode,
        email,
        feeModel,
        fee,
        maxQty,
        maxSize,
        requiresPermitForm: !!requiresPermitForm,
        permitFormAssetId: permitFormAssetId || null,
      },
      include: {
        permitFormAsset: true,
      },
    });

    return NextResponse.json(city);
  } catch (error) {
    console.error("Update city error:", error);
    return NextResponse.json(
      { error: "Failed to update city" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Kommune löschen
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.city.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete city error:", error);
    return NextResponse.json(
      { error: "Failed to delete city" },
      { status: 500 }
    );
  }
}

