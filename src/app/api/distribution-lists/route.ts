import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const distributionLists = await prisma.distributionList.findMany({
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
      { error: "Fehler beim Laden der Verteilerlisten" },
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

