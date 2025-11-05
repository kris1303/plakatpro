import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Alle Kampagnen abrufen
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        client: true,
        _count: {
          select: {
            permits: true,
            routes: true,
            photos: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neue Kampagne erstellen
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      eventName,
      eventAddress,
      eventDate,
      startDate,
      endDate,
      clientId,
      notes,
    } = data;

    if (!eventName || !eventAddress || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        eventName,
        eventAddress,
        eventDate: eventDate ? new Date(eventDate) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId: clientId || null,
        notes,
        status: "backlog",
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

