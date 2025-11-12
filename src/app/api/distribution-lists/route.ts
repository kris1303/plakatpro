import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";

  try {
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const scope = searchParams.get("scope") || "active";
    const now = new Date();

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (status) {
      where.status = status;
    }

    switch (scope) {
      case "past":
        where.archivedAt = null;
        where.endDate = { lt: now };
        break;
      case "archived":
        where.archivedAt = { not: null };
        break;
      case "all":
        break;
      case "active":
      default:
        where.archivedAt = null;
        where.endDate = { gte: now };
        break;
    }

    const distributionLists = await prisma.distributionList.findMany({
      where,
      include: {
        client: true,
        items: {
          include: {
            city: true,
          },
        },
        campaign: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(distributionLists);
  } catch (error) {
    console.error("Fehler beim Laden der Verteilerlisten:", error);
    return NextResponse.json(
      {
        error: "Fehler beim Laden der Verteilerlisten",
        ...(debug
          ? {
              details:
                error instanceof Error
                  ? { message: error.message, stack: error.stack }
                  : { raw: String(error) },
            }
          : {}),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventName,
      eventAddress,
      eventDate,
      startDate,
      endDate,
      clientId,
      notes,
      items,
    } = body;

    if (!eventName || !eventAddress || !startDate || !endDate || !clientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const distributionList = await prisma.distributionList.create({
      data: {
        eventName,
        eventAddress,
        eventDate: eventDate ? new Date(eventDate) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            cityId: item.cityId,
            quantity: item.quantity,
            posterSize: item.posterSize,
            distanceKm: item.distanceKm || null,
            fee: item.fee || null,
          })),
        },
      },
      include: {
        client: true,
        items: {
          include: {
            city: true,
          },
        },
      },
    });

    return NextResponse.json(distributionList);
  } catch (error) {
    console.error("Fehler beim Erstellen der Verteilerliste:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen der Verteilerliste" },
      { status: 500 }
    );
  }
}

