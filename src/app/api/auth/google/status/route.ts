import { NextRequest, NextResponse } from "next/server";
import { isGoogleAuthorized } from "@/lib/auth";

/**
 * GET: Prüft ob der User Google OAuth autorisiert hat
 */
export async function GET(req: NextRequest) {
  try {
    const authorized = await isGoogleAuthorized();
    return NextResponse.json({ authorized });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json({ authorized: false });
  }
}

