import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET: Alle Kunden abrufen
 */
export async function GET(req: NextRequest) {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Get clients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

/**
 * POST: Neuen Kunden erstellen
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, phone, address } = data;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

