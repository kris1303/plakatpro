import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CampaignStatus } from "@prisma/client";

/**
 * PATCH: Campaign-Status aktualisieren (für Kanban Drag & Drop)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // Validierung
    const validStatuses: CampaignStatus[] = [
      "backlog",
      "permits",
      "print",
      "planning",
      "hanging",
      "control",
      "removal_plan",
      "removal_live",
      "report",
      "archive",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Update campaign status error:", error);
    return NextResponse.json(
      { error: "Failed to update campaign status" },
      { status: 500 }
    );
  }
}

