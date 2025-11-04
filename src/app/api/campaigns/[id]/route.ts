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
        tasks: true,
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

