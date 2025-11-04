import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verteilerliste laden
    const distributionList = await prisma.distributionList.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            city: true,
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

    // Prüfen ob bereits umgewandelt
    if (distributionList.campaign) {
      return NextResponse.json(
        { error: "Wurde bereits in Kampagne umgewandelt", campaignId: distributionList.campaign.id },
        { status: 400 }
      );
    }

    // Prüfen ob Status = accepted
    if (distributionList.status !== "accepted") {
      return NextResponse.json(
        { error: "Verteilerliste muss zuerst vom Kunden angenommen werden" },
        { status: 400 }
      );
    }

    // Kampagne erstellen
    const campaign = await prisma.campaign.create({
      data: {
        eventName: distributionList.eventName,
        eventAddress: distributionList.eventAddress,
        eventDate: distributionList.eventDate,
        startDate: distributionList.startDate,
        endDate: distributionList.endDate,
        clientId: distributionList.clientId,
        notes: distributionList.notes,
        status: "permits", // Direkt in Genehmigungsphase
        distributionListId: distributionList.id,
      },
    });

    // Genehmigungen für alle Kommunen erstellen
    const permits = distributionList.items.map((item) => ({
      campaignId: campaign.id,
      cityId: item.cityId,
      status: "draft" as const,
      quantity: item.quantity,
      posterSize: item.posterSize,
      fee: item.fee || 0,
    }));

    await prisma.permit.createMany({
      data: permits,
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      permitsCreated: permits.length,
    });
  } catch (error) {
    console.error("Fehler beim Umwandeln:", error);
    return NextResponse.json(
      { error: "Fehler beim Umwandeln in Kampagne" },
      { status: 500 }
    );
  }
}

