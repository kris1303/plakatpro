import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Liste aller Touren (für Mobile App)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const installerId = searchParams.get("installerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (installerId) where.installerId = installerId;
    if (status) where.status = status;

    const routes = await prisma.route.findMany({
      where,
      include: {
        installer: true,
        campaign: true,
        stops: {
          include: {
            city: true,
            planItems: {
              include: {
                campaign: true,
                format: true,
                placements: {
                  include: {
                    photo: true,
                  },
                },
              },
            },
          },
          orderBy: { seq: "asc" },
        },
      },
      orderBy: { plannedDate: "desc" },
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error("Get tours error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neue Tour erstellen
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { installerId, plannedDate, campaignId, stops } = data;

    const route = await prisma.route.create({
      data: {
        installerId,
        plannedDate: new Date(plannedDate),
        campaignId,
        status: "planned",
        stops: {
          create: stops?.map((stop: any, index: number) => ({
            seq: index,
            cityId: stop.cityId,
            placeId: stop.placeId,
            lat: stop.lat,
            lng: stop.lng,
            notes: stop.notes,
          })) || [],
        },
      },
      include: {
        stops: true,
      },
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error("Create tour error:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}

