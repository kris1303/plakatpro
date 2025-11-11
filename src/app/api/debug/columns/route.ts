import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Campaign'
      ORDER BY column_name;
    `;

    return NextResponse.json({
      databaseHost: (() => {
        try {
          if (!process.env.DATABASE_URL) return "unknown";
          return new URL(process.env.DATABASE_URL).host;
        } catch {
          return "parse-error";
        }
      })(),
      columns: result.map((row) => row.column_name),
    });
  } catch (error: any) {
    console.error("debug/columns error:", error);
    return NextResponse.json(
      { error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

