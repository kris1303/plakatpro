import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Alle Genehmigungen abrufen
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");
    const cityId = searchParams.get("cityId");

    const where: any = {};
    if (status) where.status = status;
    if (campaignId) where.campaignId = campaignId;
    if (cityId) where.cityId = cityId;

    const permits = await prisma.permit.findMany({
      where,
      include: {
        campaign: true,
        city: true,
      },
      orderBy: { requestedAt: "desc" },
    });

    return NextResponse.json(permits);
  } catch (error) {
    console.error("Get permits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permits" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neue Genehmigung beantragen
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { campaignId, cityId, notes } = data;

    if (!campaignId || !cityId) {
      return NextResponse.json(
        { error: "Campaign and city are required" },
        { status: 400 }
      );
    }

    const permit = await prisma.permit.create({
      data: {
        campaignId,
        cityId,
        notes,
        status: "requested",
      },
      include: {
        campaign: true,
        city: true,
      },
    });

    return NextResponse.json(permit);
  } catch (error) {
    console.error("Create permit error:", error);
    return NextResponse.json(
      { error: "Failed to create permit" },
      { status: 500 }
    );
  }
}

