import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function sanitizeTableName(raw: string | null): string {
  if (!raw) return "Campaign";
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) {
    throw new Error("Invalid table name");
  }
  return raw;
}

export async function GET(request: NextRequest) {
  try {
    const table = sanitizeTableName(request.nextUrl.searchParams.get("table"));

    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = ${table}
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
      table,
      columns: result.map((row) => row.column_name),
    });
  } catch (error: any) {
    console.error("debug/columns error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Unknown error",
        stack: error?.stack,
      },
      { status: 500 }
    );
  }
}

