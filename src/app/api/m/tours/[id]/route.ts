import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Einzelne Tour mit allen Details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const route = await prisma.route.findUnique({
      where: { id },
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
    });

    if (!route) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 });
    }

    return NextResponse.json(route);
  } catch (error) {
    console.error("Get tour error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Tour-Status aktualisieren
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();

    const route = await prisma.route.update({
      where: { id },
      data,
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error("Update tour error:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}

