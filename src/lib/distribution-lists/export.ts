import { prisma } from "@/lib/prisma";

export const PRICE_A1 = 3.0;
export const PRICE_A0 = 6.0;
export const PRICE_PER_APPLICATION = 5.0;
export const VAT_RATE = 0.19;

export async function fetchDistributionListForExport(id: string) {
  return prisma.distributionList.findUnique({
    where: { id },
    include: {
      client: true,
      posterImageAsset: true,
      items: {
        include: {
          city: {
            select: {
              id: true,
              name: true,
              postalCode: true,
              email: true,
              requiresPermitForm: true,
              permitFormAsset: {
                select: {
                  id: true,
                  fileName: true,
                  contentType: true,
                  size: true,
                  key: true,
                },
              },
            },
          },
        },
        orderBy: {
          city: {
            postalCode: "asc",
          },
        },
      },
    },
  });
}

export type DistributionListExportData = NonNullable<
  Awaited<ReturnType<typeof fetchDistributionListForExport>>
>;

export function calculateDistributionListCosts(distributionList: DistributionListExportData) {
  const totalQuantity = distributionList.items.reduce((sum, item) => sum + item.quantity, 0);
  const quantityA1 = distributionList.items
    .filter((item) => item.posterSize === "A1")
    .reduce((sum, item) => sum + item.quantity, 0);
  const quantityA0 = distributionList.items
    .filter((item) => item.posterSize === "A0")
    .reduce((sum, item) => sum + item.quantity, 0);
  const costA1 = quantityA1 * PRICE_A1;
  const costA0 = quantityA0 * PRICE_A0;
  const costApplications = distributionList.items.length * PRICE_PER_APPLICATION;
  const costCityFees = distributionList.items.reduce((sum, item) => sum + (item.fee || 0), 0);
  const subtotal = costA1 + costA0 + costApplications + costCityFees;
  const vat = subtotal * VAT_RATE;
  const total = subtotal + vat;

  return {
    totalQuantity,
    quantityA1,
    quantityA0,
    costA1,
    costA0,
    costApplications,
    costCityFees,
    subtotal,
    vat,
    total,
  };
}

export async function generateDistributionListPdf(
  distributionList: DistributionListExportData
) {
  const costs = calculateDistributionListCosts(distributionList);

  const pdfMakeBuild = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeBuild.default || pdfMakeBuild;

  if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
    (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
  }

  const tableBody = [
    [
      { text: "PLZ", style: "tableHeader", fillColor: "#f3f4f6" },
      { text: "Stadt", style: "tableHeader", fillColor: "#f3f4f6" },
      { text: "Entfernung (km)", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
      { text: "Anzahl Plakate", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
      { text: "Größe", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
      { text: "Gebühr (€)", style: "tableHeader", alignment: "right", fillColor: "#f3f4f6" },
    ],
    ...distributionList.items.map((item) => [
      { text: item.city.postalCode || "-", style: "tableCell" },
      { text: item.city.name, style: "tableCell", bold: true },
      {
        text: item.distanceKm ? item.distanceKm.toFixed(1) : "-",
        style: "tableCell",
        alignment: "center",
      },
      { text: item.quantity.toString(), style: "tableCell", alignment: "center" },
      { text: item.posterSize, style: "tableCell", alignment: "center" },
      { text: `${(item.fee || 0).toFixed(2)} €`, style: "tableCell", alignment: "right" },
    ]),
    [
      {
        text: `Gesamt (${distributionList.items.length} Kommunen)`,
        style: "tableFooter",
        bold: true,
        colSpan: 3,
      },
      {},
      {},
      { text: costs.totalQuantity.toString(), style: "tableFooter", bold: true, alignment: "center" },
      {},
      { text: `${costs.costCityFees.toFixed(2)} €`, style: "tableFooter", bold: true, alignment: "right" },
    ],
  ];

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 60, 40, 60],
    content: [
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
              distributionList.eventDate
                ? { text: "EVENT-DATUM", style: "sectionLabel" }
                : {},
              distributionList.eventDate
                ? {
                    text: new Date(distributionList.eventDate).toLocaleDateString("de-DE"),
                    style: "sectionValue",
                  }
                : {},
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
                text: `${new Date(distributionList.startDate).toLocaleDateString("de-DE")} - ${new Date(
                  distributionList.endDate
                ).toLocaleDateString("de-DE")}`,
                style: "sectionValue",
              },
              { text: " ", margin: [0, 5] },
              { text: "ERSTELLT AM", style: "sectionLabel" },
              {
                text: new Date(distributionList.createdAt).toLocaleDateString("de-DE"),
                style: "sectionValue",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [40, "*", 60, 60, 40, 60],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex: number) =>
            rowIndex === 0 || rowIndex === tableBody.length - 1 ? "#f3f4f6" : null,
          hLineWidth: (i: number) => (i === 0 || i === 1 || i === tableBody.length ? 1 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => "#e5e7eb",
        },
        margin: [0, 0, 0, 20],
      },
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
                  { text: costs.totalQuantity.toString(), style: "summaryValue", alignment: "center" },
                ],
                fillColor: "#eff6ff",
                border: [false, true, false, true],
              },
              {
                stack: [
                  { text: "GEBÜHREN KOMMUNEN", style: "summaryLabel", alignment: "center" },
                  { text: `${costs.costCityFees.toFixed(2)} €`, style: "summaryValue", alignment: "center" },
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
      {
        text: "KOSTENÜBERSICHT",
        style: "sectionHeader",
        margin: [0, 10, 0, 10],
      },
      {
        table: {
          widths: ["*", 80, 60, 80],
          body: [
            [
              { text: "Position", style: "tableHeader", fillColor: "#f3f4f6" },
              { text: "Menge", style: "tableHeader", alignment: "center", fillColor: "#f3f4f6" },
              { text: "Preis", style: "tableHeader", alignment: "right", fillColor: "#f3f4f6" },
              { text: "Gesamt", style: "tableHeader", alignment: "right", fillColor: "#f3f4f6" },
            ],
            [
              { text: "A1 Plakate", style: "tableCell" },
              { text: `${costs.quantityA1}x`, style: "tableCell", alignment: "center" },
              { text: `${PRICE_A1.toFixed(2)} €`, style: "tableCell", alignment: "right" },
              { text: `${costs.costA1.toFixed(2)} €`, style: "tableCell", alignment: "right", bold: true },
            ],
            [
              { text: "A0 Plakate", style: "tableCell" },
              { text: `${costs.quantityA0}x`, style: "tableCell", alignment: "center" },
              { text: `${PRICE_A0.toFixed(2)} €`, style: "tableCell", alignment: "right" },
              { text: `${costs.costA0.toFixed(2)} €`, style: "tableCell", alignment: "right", bold: true },
            ],
            [
              { text: "Anträge bei Kommunen", style: "tableCell" },
              { text: `${distributionList.items.length}x`, style: "tableCell", alignment: "center" },
              { text: `${PRICE_PER_APPLICATION.toFixed(2)} €`, style: "tableCell", alignment: "right" },
              { text: `${costs.costApplications.toFixed(2)} €`, style: "tableCell", alignment: "right", bold: true },
            ],
            [
              { text: "Gebühren der Kommunen", style: "tableCell" },
              { text: `${distributionList.items.length}x`, style: "tableCell", alignment: "center" },
              { text: "variabel", style: "tableCell", alignment: "right" },
              { text: `${costs.costCityFees.toFixed(2)} €`, style: "tableCell", alignment: "right", bold: true },
            ],
            [
              {
                text: "Zwischensumme (Netto)",
                style: "tableFooter",
                bold: true,
                colSpan: 3,
                fillColor: "#f9fafb",
              },
              {},
              {},
              {
                text: `${costs.subtotal.toFixed(2)} €`,
                style: "tableFooter",
                bold: true,
                alignment: "right",
                fillColor: "#f9fafb",
              },
            ],
            [
              { text: "MwSt. (19%)", style: "tableCell", colSpan: 3 },
              {},
              {},
              {
                text: `${costs.vat.toFixed(2)} €`,
                style: "tableCell",
                alignment: "right",
                bold: true,
              },
            ],
            [
              {
                text: "GESAMTSUMME (BRUTTO)",
                style: "tableFooter",
                bold: true,
                colSpan: 3,
                fillColor: "#dcfce7",
                fontSize: 11,
              },
              {},
              {},
              {
                text: `${costs.total.toFixed(2)} €`,
                style: "tableFooter",
                bold: true,
                alignment: "right",
                fillColor: "#dcfce7",
                color: "#15803d",
                fontSize: 13,
              },
            ],
          ],
        },
        layout: {
          hLineWidth: function (i: number, node: any) {
            return i === 0 || i === 1 || i === node.table.body.length - 3 || i === node.table.body.length
              ? 1
              : 0.5;
          },
          vLineWidth: function () {
            return 0.5;
          },
          hLineColor: function (i: number, node: any) {
            return i === 0 || i === 1 ? "#d1d5db" : "#e5e7eb";
          },
          vLineColor: function () {
            return "#e5e7eb";
          },
        },
        margin: [0, 0, 0, 20],
      },
      distributionList.notes
        ? {
            stack: [
              { text: "NOTIZEN", style: "sectionLabel" },
              { text: distributionList.notes, style: "notes" },
            ],
            margin: [0, 0, 0, 20],
          }
        : {},
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

  return new Promise<{ buffer: Buffer; fileName: string; costs: ReturnType<typeof calculateDistributionListCosts> }>(
    (resolve, reject) => {
      const pdfDoc = (pdfMake as any).createPdf(docDefinition);
      pdfDoc.getBuffer((buffer: Buffer) => {
        const fileName = `Verteilerliste_${distributionList.eventName.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date()
          .toISOString()
          .split("T")[0]}.pdf`;
        resolve({ buffer, fileName, costs });
      });
    }
  );
}

