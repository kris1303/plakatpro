import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const distributionList = await prisma.distributionList.findUnique({
      where: { id: params.id },
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

    // HTML für PDF generieren
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      padding: 40px;
      color: #111827;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #3B82F6;
      margin-bottom: 10px;
    }
    h1 {
      font-size: 28px;
      margin: 10px 0;
      color: #1F2937;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .info-value {
      font-size: 14px;
      color: #1F2937;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #F3F4F6;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4B5563;
      text-transform: uppercase;
      border-bottom: 2px solid #E5E7EB;
    }
    th.center {
      text-align: center;
    }
    th.right {
      text-align: right;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
      font-size: 14px;
    }
    td.center {
      text-align: center;
    }
    td.right {
      text-align: right;
    }
    tr:hover {
      background: #F9FAFB;
    }
    tfoot {
      background: #F3F4F6;
      font-weight: 600;
    }
    tfoot td {
      border-top: 2px solid #D1D5DB;
      padding: 15px 12px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
      font-size: 12px;
      color: #6B7280;
      text-align: center;
    }
    .summary-box {
      background: #EFF6FF;
      border: 2px solid #3B82F6;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: center;
    }
    .summary-item {
      display: inline-block;
      margin: 0 30px;
    }
    .summary-label {
      font-size: 12px;
      color: #1D4ED8;
      font-weight: 600;
      text-transform: uppercase;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: #1E40AF;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🎯 WERBEINSEL</div>
    <h1>Verteilerliste</h1>
  </div>

  <div class="info-grid">
    <div>
      <div class="info-item">
        <div class="info-label">Event</div>
        <div class="info-value">${distributionList.eventName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Event-Adresse</div>
        <div class="info-value">${distributionList.eventAddress}</div>
      </div>
      ${distributionList.eventDate ? `
      <div class="info-item">
        <div class="info-label">Event-Datum</div>
        <div class="info-value">${new Date(distributionList.eventDate).toLocaleDateString("de-DE")}</div>
      </div>
      ` : ""}
    </div>
    <div>
      <div class="info-item">
        <div class="info-label">Kunde</div>
        <div class="info-value">${distributionList.client.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Kampagnenzeitraum</div>
        <div class="info-value">
          ${new Date(distributionList.startDate).toLocaleDateString("de-DE")} - 
          ${new Date(distributionList.endDate).toLocaleDateString("de-DE")}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Erstellt am</div>
        <div class="info-value">${new Date(distributionList.createdAt).toLocaleDateString("de-DE")}</div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>PLZ</th>
        <th>Stadt</th>
        <th class="center">Entfernung (km)</th>
        <th class="center">Anzahl Plakate</th>
        <th class="center">Größe</th>
        <th class="right">Gebühr (€)</th>
      </tr>
    </thead>
    <tbody>
      ${distributionList.items.map((item) => `
        <tr>
          <td>${item.city.postalCode || "-"}</td>
          <td><strong>${item.city.name}</strong></td>
          <td class="center">${item.distanceKm ? item.distanceKm.toFixed(1) : "-"}</td>
          <td class="center">${item.quantity}</td>
          <td class="center">${item.posterSize}</td>
          <td class="right">${(item.fee || 0).toFixed(2)} €</td>
        </tr>
      `).join("")}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2"><strong>Gesamt (${distributionList.items.length} Kommunen)</strong></td>
        <td></td>
        <td class="center"><strong>${totalQuantity}</strong></td>
        <td></td>
        <td class="right"><strong>${totalFees.toFixed(2)} €</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="summary-box">
    <div class="summary-item">
      <div class="summary-label">Kommunen</div>
      <div class="summary-value">${distributionList.items.length}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Plakate gesamt</div>
      <div class="summary-value">${totalQuantity}</div>
    </div>
    <div class="summary-item">
      <div class="summary-label">Gebühren gesamt</div>
      <div class="summary-value">${totalFees.toFixed(2)} €</div>
    </div>
  </div>

  ${distributionList.notes ? `
  <div style="background: #FFFBEB; border: 2px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
    <div style="font-size: 12px; font-weight: 600; color: #D97706; text-transform: uppercase; margin-bottom: 5px;">
      Notizen
    </div>
    <div style="font-size: 14px; color: #78350F;">
      ${distributionList.notes}
    </div>
  </div>
  ` : ""}

  <div class="footer">
    <p>Erstellt mit PlakatPro - Plakatverwaltungssystem</p>
    <p>Dieses Dokument wurde automatisch generiert am ${new Date().toLocaleDateString("de-DE")} um ${new Date().toLocaleTimeString("de-DE")}</p>
  </div>
</body>
</html>
    `;

    // Einfache HTML-Response (Browser kann das als PDF drucken)
    // Für echte PDF-Generierung würde man Puppeteer oder ähnliche Libraries nutzen
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="Verteilerliste_${distributionList.eventName}.html"`,
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

