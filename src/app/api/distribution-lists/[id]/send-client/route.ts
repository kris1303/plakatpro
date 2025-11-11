import { NextResponse } from "next/server";

import {
  fetchDistributionListForExport,
  generateDistributionListPdf,
} from "@/lib/distribution-lists/export";
import { sendRawEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    if (!distributionList.client?.email) {
      return NextResponse.json(
        { error: "Der Kunde hat keine E-Mail-Adresse hinterlegt." },
        { status: 400 }
      );
    }

    if (!distributionList.items.length) {
      return NextResponse.json(
        {
          error:
            "Die Verteilerliste enthält keine Kommunen. Bitte fügen Sie mindestens eine Kommune hinzu.",
        },
        { status: 400 }
      );
    }

    const { buffer, fileName, costs } =
      await generateDistributionListPdf(distributionList);

    const previewRows = distributionList.items
      .slice(0, 5)
      .map(
        (item) =>
          `${item.city.postalCode || "-"} ${item.city.name} – ${
            item.posterSize
          } (${item.quantity}x)`
      )
      .join("\n");

    const subject = `Verteilerliste ${distributionList.eventName}`;
    const textBody = `Hallo ${distributionList.client.name},

anbei erhalten Sie die aktuelle Verteilerliste zu "${distributionList.eventName}" als PDF.

Wichtige Kennzahlen:
- Kampagnenzeitraum: ${new Date(
      distributionList.startDate
    ).toLocaleDateString("de-DE")} – ${new Date(
      distributionList.endDate
    ).toLocaleDateString("de-DE")}
- Kommunen: ${distributionList.items.length}
- A1 Plakate: ${costs.quantityA1}
- A0 Plakate: ${costs.quantityA0}
- Gesamtsumme (brutto): ${costs.total.toFixed(2)} €

Auszug (erste Kommunen):
${previewRows}

Die vollständige Liste entnehmen Sie bitte dem Anhang.

Bei Rückfragen stehen wir jederzeit zur Verfügung.

Freundliche Grüße
Werbeinsel`;

    const htmlBody = `
      <p>Hallo ${distributionList.client.name},</p>
      <p>anbei erhalten Sie die aktuelle Verteilerliste zu "<strong>${distributionList.eventName}</strong>" als PDF.</p>
      <p><strong>Wichtige Kennzahlen:</strong></p>
      <ul>
        <li>Kampagnenzeitraum: <strong>${new Date(
          distributionList.startDate
        ).toLocaleDateString("de-DE")} – ${new Date(
      distributionList.endDate
    ).toLocaleDateString("de-DE")}</strong></li>
        <li>Kommunen: <strong>${distributionList.items.length}</strong></li>
        <li>A1 Plakate: <strong>${costs.quantityA1}</strong></li>
        <li>A0 Plakate: <strong>${costs.quantityA0}</strong></li>
        <li>Gesamtsumme (brutto): <strong>${costs.total.toFixed(
          2
        )} €</strong></li>
      </ul>
      <p><strong>Auszug (erste Kommunen):</strong></p>
      <pre style="background:#f8fafc;padding:12px;border-radius:8px;">${previewRows}</pre>
      <p>Die vollständige Liste entnehmen Sie bitte dem Anhang.</p>
      <p>Bei Rückfragen stehen wir jederzeit zur Verfügung.</p>
      <p>Freundliche Grüße<br/>Werbeinsel</p>
    `;

    await sendRawEmail({
      from: process.env.SES_FROM_ADDRESS || "",
      to: distributionList.client.email,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: fileName,
          contentType: "application/pdf",
          content: buffer,
        },
      ],
    });

    await prisma.distributionList.update({
      where: { id: distributionList.id },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fehler beim Versand an den Kunden:", error);
    return NextResponse.json(
      { error: "E-Mail konnte nicht gesendet werden." },
      { status: 500 }
    );
  }
}

