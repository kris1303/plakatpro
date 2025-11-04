import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    // Alle Draft-Permits der Kampagne auf "sent" setzen
    const result = await prisma.permit.updateMany({
      where: {
        campaignId: campaignId,
        status: "draft",
      },
      data: {
        status: "sent",
        requestedAt: new Date(),
      },
    });

    // Kampagne-Status auf "permits" setzen (falls noch nicht)
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "permits" },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
    });
  } catch (error) {
    console.error("Fehler beim Beantragen der Genehmigungen:", error);
    return NextResponse.json(
      { error: "Fehler beim Beantragen der Genehmigungen" },
      { status: 500 }
    );
  }
}

