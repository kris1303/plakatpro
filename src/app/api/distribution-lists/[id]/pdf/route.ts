import { NextResponse } from "next/server";
import { fetchDistributionListForExport, generateDistributionListPdf } from "@/lib/distribution-lists/export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const distributionList = await fetchDistributionListForExport(id);

    if (!distributionList) {
      return NextResponse.json(
        { error: "Verteilerliste nicht gefunden" },
        { status: 404 }
      );
    }

    const { buffer, fileName } = await generateDistributionListPdf(distributionList);

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Fehler beim PDF-Export:", error);
    return NextResponse.json(
      { error: "Fehler beim PDF-Export" },
      { status: 500 }
    );
  }
}
