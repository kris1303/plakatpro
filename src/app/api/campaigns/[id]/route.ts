import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        client: true,
        distributionList: true,
        permits: {
          include: {
            city: true,
          },
        },
        routes: true,
        photos: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Kampagne nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Fehler beim Laden der Kampagne:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Kampagne" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, archived } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (typeof archived === "boolean") {
      updateData.archivedAt = archived ? new Date() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Keine Änderungen übermittelt" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        distributionList: true,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Kampagne:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Kampagne" },
      { status: 500 }
    );
  }
}

