import { NextRequest, NextResponse } from "next/server";

/**
 * POST: ABM (Wettbewerbs-Monitoring) Foto hochladen
 * Für Plakate von Wettbewerbern
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const notes = formData.get("notes") as string;
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // TODO: Implementiere OCR für Texterkennung (optional)
    // TODO: Speichere in separater ABM-Tabelle oder mit Flag in Photos

    // Für jetzt: einfach bestätigen
    return NextResponse.json({
      success: true,
      message: "ABM Foto erfasst",
      location: { lat, lng },
      notes,
    });
  } catch (error) {
    console.error("ABM upload error:", error);
    return NextResponse.json(
      { error: "Failed to process ABM photo" },
      { status: 500 }
    );
  }
}

