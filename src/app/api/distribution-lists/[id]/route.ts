import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = new URL(request.url);
  const debugMode = url.searchParams.get("debug") === "1";

  try {
    const { id } = await params;
    const distributionList = await prisma.distributionList.findUnique({
      where: { id },
      include: {
        client: true,
        posterImageAsset: true,
        items: {
          include: {
            city: {
              include: {
                permitFormAsset: true,
              },
            },
            emails: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            city: {
              postalCode: "asc",
            },
          },
        },
        campaign: true,
      },
    });

    if (!distributionList) {
      return NextResponse.json(
        { error: "Verteilerliste nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(distributionList);
  } catch (error: any) {
    console.error("Fehler beim Laden der Verteilerliste:", error);
    return NextResponse.json(
      debugMode
        ? {
            error: "Fehler beim Laden der Verteilerliste",
            details: error?.message,
            stack: error?.stack,
          }
        : { error: "Fehler beim Laden der Verteilerliste" },
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
    const { status, archived, notes } = body;

    const updateData: any = {};

    if (status) {
      updateData.status = status;

      if (status === "sent" && !updateData.sentAt) {
        updateData.sentAt = new Date();
      }

      if (status === "accepted" && !updateData.acceptedAt) {
        updateData.acceptedAt = new Date();
      }
    }

    if (typeof archived === "boolean") {
      updateData.archivedAt = archived ? new Date() : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Keine Änderungen übermittelt" },
        { status: 400 }
      );
    }

    const distributionList = await prisma.distributionList.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        items: {
          include: {
            city: true,
            emails: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(distributionList);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Verteilerliste:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Verteilerliste" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      eventName,
      eventAddress,
      eventDate,
      startDate,
      endDate,
      clientId,
      notes,
      posterImageAssetId,
      items,
    } = body;

    // Lösche alte Items
    await prisma.distributionListItem.deleteMany({
      where: { distributionListId: id },
    });

    // Update Verteilerliste mit neuen Items
    const distributionList = await prisma.distributionList.update({
      where: { id },
      data: {
        eventName,
        eventAddress,
        eventDate: eventDate ? new Date(eventDate) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId,
        notes: notes || null,
        posterImageAssetId: posterImageAssetId || null,
        items: {
          create: items.map((item: any) => ({
            cityId: item.cityId,
            quantity: item.quantity,
            posterSize: item.posterSize,
            distanceKm: item.distanceKm || null,
            fee: item.fee || null,
            includePosterImage: !!item.includePosterImage,
            includePermitForm: !!item.includePermitForm,
          })),
        },
      },
      include: {
        client: true,
        posterImageAsset: true,
        items: {
          include: {
            city: {
              include: {
                permitFormAsset: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(distributionList);
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Verteilerliste:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Verteilerliste" },
      { status: 500 }
    );
  }
}

