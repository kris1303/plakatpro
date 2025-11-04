import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const distributionList = await prisma.distributionList.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            city: true,
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
  } catch (error) {
    console.error("Fehler beim Laden der Verteilerliste:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Verteilerliste" },
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
    const { status } = body;

    const updateData: any = { status };

    if (status === "sent" && !updateData.sentAt) {
      updateData.sentAt = new Date();
    }

    if (status === "accepted" && !updateData.acceptedAt) {
      updateData.acceptedAt = new Date();
    }

    const distributionList = await prisma.distributionList.update({
      where: { id },
      data: updateData,
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
    console.error("Fehler beim Aktualisieren der Verteilerliste:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren der Verteilerliste" },
      { status: 500 }
    );
  }
}

