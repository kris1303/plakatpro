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
      },
    });

    if (!distributionList) {
      return NextResponse.json(
        { error: "Verteilerliste nicht gefunden" },
        { status: 404 }
      );
    }

    const totalQuantity = distributionList.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalFees = distributionList.items.reduce((sum, item) => sum + (item.fee || 0), 0);

    // Dynamischer Import von pdfmake (für Vercel Compatibility)
    const pdfMakeBuild = await import("pdfmake/build/pdfmake");
    const pdfFonts = await import("pdfmake/build/vfs_fonts");
    const pdfMake = pdfMakeBuild.default || pdfMakeBuild;
    
    // Fonts setzen
    if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
      (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
    }

    // Tabellen-Rows für die Kommunen
    const tableBody = [
      // Header
      [
        { text: "PLZ", style: "tableHeader", fillColor: "#f3f4f6" },
        { text: "Stadt", style: "tableHeader", fillColor: "#f3f4f6" },
        { text: "Entfernung (km)", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
        { text: "Anzahl Plakate", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
        { text: "Größe", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
        { text: "Gebühr (€)", style: "tableHeader", alignment: "right", fillColor: "#f3f4f6" },
      ],
      // Data rows
      ...distributionList.items.map((item) => [
        { text: item.city.postalCode || "-", style: "tableCell" },
        { text: item.city.name, style: "tableCell", bold: true },
        { text: item.distanceKm ? item.distanceKm.toFixed(1) : "-", style: "tableCell", alignment: "center" },
        { text: item.quantity.toString(), style: "tableCell", alignment: "center" },
        { text: item.posterSize, style: "tableCell", alignment: "center" },
        { text: `${(item.fee || 0).toFixed(2)} €`, style: "tableCell", alignment: "right" },
      ]),
      // Footer row
      [
        { text: `Gesamt (${distributionList.items.length} Kommunen)`, style: "tableFooter", bold: true, colSpan: 3 },
        {},
        {},
        { text: totalQuantity.toString(), style: "tableFooter", bold: true, alignment: "center" },
        {},
        { text: `${totalFees.toFixed(2)} €`, style: "tableFooter", bold: true, alignment: "right" },
      ],
    ];

    // PDF-Definition
    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        // Header
        {
          text: "🎯 WERBEINSEL",
          style: "logo",
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
        {
          text: "Verteilerliste",
          style: "title",
          alignment: "center",
          margin: [0, 0, 0, 20],
        },

        // Event-Info Grid
        {
          columns: [
            {
              width: "50%",
              stack: [
                { text: "EVENT", style: "sectionLabel" },
                { text: distributionList.eventName, style: "sectionValue" },
                { text: " ", margin: [0, 5] },

                { text: "EVENT-ADRESSE", style: "sectionLabel" },
                { text: distributionList.eventAddress, style: "sectionValue" },
                { text: " ", margin: [0, 5] },

                distributionList.eventDate ? { text: "EVENT-DATUM", style: "sectionLabel" } : {},
                distributionList.eventDate ? { text: new Date(distributionList.eventDate).toLocaleDateString("de-DE"), style: "sectionValue" } : {},
              ],
            },
            {
              width: "50%",
              stack: [
                { text: "KUNDE", style: "sectionLabel" },
                { text: distributionList.client.name, style: "sectionValue" },
                { text: " ", margin: [0, 5] },

                { text: "KAMPAGNENZEITRAUM", style: "sectionLabel" },
                {
                  text: `${new Date(distributionList.startDate).toLocaleDateString("de-DE")} - ${new Date(distributionList.endDate).toLocaleDateString("de-DE")}`,
                  style: "sectionValue",
                },
                { text: " ", margin: [0, 5] },

                { text: "ERSTELLT AM", style: "sectionLabel" },
                { text: new Date(distributionList.createdAt).toLocaleDateString("de-DE"), style: "sectionValue" },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Kommunen-Tabelle
        {
          table: {
            headerRows: 1,
            widths: [40, "*", 60, 60, 40, 60],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 || rowIndex === tableBody.length - 1) ? "#f3f4f6" : null,
            hLineWidth: (i: number) => (i === 0 || i === 1 || i === tableBody.length) ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: () => "#e5e7eb",
          },
          margin: [0, 0, 0, 20],
        },

        // Summary Box
        {
          table: {
            widths: ["*", "*", "*"],
            body: [
              [
                {
                  stack: [
                    { text: "KOMMUNEN", style: "summaryLabel", alignment: "center" },
                    { text: distributionList.items.length.toString(), style: "summaryValue", alignment: "center" },
                  ],
                  fillColor: "#eff6ff",
                  border: [true, true, false, true],
                },
                {
                  stack: [
                    { text: "PLAKATE GESAMT", style: "summaryLabel", alignment: "center" },
                    { text: totalQuantity.toString(), style: "summaryValue", alignment: "center" },
                  ],
                  fillColor: "#eff6ff",
                  border: [false, true, false, true],
                },
                {
                  stack: [
                    { text: "GEBÜHREN GESAMT", style: "summaryLabel", alignment: "center" },
                    { text: `${totalFees.toFixed(2)} €`, style: "summaryValue", alignment: "center" },
                  ],
                  fillColor: "#eff6ff",
                  border: [false, true, true, true],
                },
              ],
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 0, 20],
        },

        // Notizen
        distributionList.notes ? {
          stack: [
            { text: "NOTIZEN", style: "sectionLabel" },
            { text: distributionList.notes, style: "notes" },
          ],
          margin: [0, 0, 0, 20],
        } : {},

        // Footer
        {
          text: [
            "Erstellt mit PlakatPro - Plakatverwaltungssystem\n",
            `Generiert am ${new Date().toLocaleDateString("de-DE")} um ${new Date().toLocaleTimeString("de-DE")}`,
          ],
          style: "footer",
          alignment: "center",
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        logo: {
          fontSize: 18,
          bold: true,
          color: "#3B82F6",
        },
        title: {
          fontSize: 24,
          bold: true,
          color: "#1F2937",
        },
        sectionLabel: {
          fontSize: 9,
          bold: true,
          color: "#6B7280",
          margin: [0, 0, 0, 3],
        },
        sectionValue: {
          fontSize: 11,
          color: "#1F2937",
        },
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: "#4B5563",
          margin: [5, 5],
        },
        tableCell: {
          fontSize: 10,
          color: "#1F2937",
          margin: [5, 8],
        },
        tableFooter: {
          fontSize: 10,
          fillColor: "#f3f4f6",
          margin: [5, 10],
        },
        summaryLabel: {
          fontSize: 9,
          bold: true,
          color: "#1D4ED8",
          margin: [0, 10, 0, 5],
        },
        summaryValue: {
          fontSize: 20,
          bold: true,
          color: "#1E40AF",
          margin: [0, 0, 0, 10],
        },
        notes: {
          fontSize: 10,
          color: "#78350F",
          background: "#FFFBEB",
          margin: [10, 10],
        },
        footer: {
          fontSize: 8,
          color: "#6B7280",
          italics: true,
        },
      },
    };

    // PDF erstellen
    const pdfDoc = (pdfMake as any).createPdf(docDefinition);

    // PDF als Buffer generieren
    return new Promise<NextResponse>((resolve, reject) => {
      pdfDoc.getBuffer((buffer: Buffer) => {
        const response = new NextResponse(buffer as any, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Verteilerliste_${distributionList.eventName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf"`,
          },
        });
        resolve(response);
      });
    });
  } catch (error) {
    console.error("Fehler beim PDF-Export:", error);
    return NextResponse.json(
      { error: "Fehler beim PDF-Export" },
      { status: 500 }
    );
  }
}
