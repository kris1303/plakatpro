import { NextResponse } from "next/server";
import { EmailDirection, EmailStatus, PermitStatus } from "@prisma/client";

import {
	fetchDistributionListForExport,
	type DistributionListExportData,
} from "@/lib/distribution-lists/export";
import { sendRawEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { downloadFromS3 } from "@/lib/storage";

type SendResult = {
	itemId: string;
	cityName: string;
	email?: string | null;
	status: "sent" | "skipped" | "failed";
	messageId?: string;
	error?: string;
};

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

		if (!distributionList.items.length) {
			return NextResponse.json(
				{ error: "Keine Kommunen in der Verteilerliste" },
				{ status: 400 }
			);
		}

		const sendResults: SendResult[] = [];
		const sentAt = new Date();
		const assetCache = new Map<
			string,
			{ buffer: Buffer; contentType: string }
		>();

		const getCachedAsset = async (
			asset:
				| (DistributionListExportData["posterImageAsset"] & { key: string })
				| (NonNullable<
						DistributionListExportData["items"][number]["city"]["permitFormAsset"]
				  > & { key: string })
				| null
				| undefined
		) => {
			if (!asset) return null;
			if (assetCache.has(asset.id)) {
				return assetCache.get(asset.id)!;
			}
			const downloaded = await downloadFromS3(asset.key);
			assetCache.set(asset.id, downloaded);
			return downloaded;
		};

		for (const item of distributionList.items) {
			const recipient = item.city.email;

			if (!recipient) {
				sendResults.push({
					itemId: item.id,
					cityName: item.city.name,
					email: recipient,
					status: "skipped",
					error: "Keine E-Mail-Adresse hinterlegt",
				});
				continue;
			}

			const subject = `Plakatierungsantrag – ${distributionList.eventName} – ${item.city.name}`;

			const textBody = `Guten Tag ${item.city.name},

wir beantragen die Genehmigung zur Plakatierung für "${distributionList.eventName}" im Zeitraum ${new Date(
				distributionList.startDate
			).toLocaleDateString("de-DE")} bis ${new Date(
				distributionList.endDate
			).toLocaleDateString("de-DE")}.

Kommunendetails:
- Anzahl Plakate: ${item.quantity}
- Format: ${item.posterSize}
- Entfernung: ${item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : "nicht verfügbar"}

Anbei finden Sie die relevanten Unterlagen zur Prüfung. Bei Rückfragen stehen wir gerne zur Verfügung.

Vielen Dank und freundliche Grüße
Werbeinsel`;

			const htmlBody = `
				<p>Guten Tag ${item.city.name},</p>
				<p>wir beantragen die Genehmigung zur Plakatierung für "${distributionList.eventName}" im Zeitraum
				${new Date(distributionList.startDate).toLocaleDateString("de-DE")}
				bis ${new Date(distributionList.endDate).toLocaleDateString("de-DE")}.</p>
				<p><strong>Kommunendetails:</strong></p>
				<ul>
					<li>Anzahl Plakate: <strong>${item.quantity}</strong></li>
					<li>Format: <strong>${item.posterSize}</strong></li>
					<li>Entfernung: <strong>${
						item.distanceKm ? `${item.distanceKm.toFixed(1)} km` : "nicht verfügbar"
					}</strong></li>
				</ul>
				<p>Anbei finden Sie die relevanten Unterlagen zur Prüfung. Bei Rückfragen stehen wir gerne zur Verfügung.</p>
				<p>Vielen Dank und freundliche Grüße<br/>Werbeinsel</p>
			`;

			const attachments: Parameters<typeof sendRawEmail>[0]["attachments"] = [];

			const attachmentMeta: { filename: string; contentType: string }[] = [];

			try {
				if (
					item.includePosterImage &&
					distributionList.posterImageAsset
				) {
					const asset = await getCachedAsset(distributionList.posterImageAsset);
					if (asset) {
						attachments.push({
							filename: distributionList.posterImageAsset.fileName,
							contentType:
								asset.contentType ||
								distributionList.posterImageAsset.contentType ||
								"application/octet-stream",
							content: asset.buffer,
						});
						attachmentMeta.push({
							filename: distributionList.posterImageAsset.fileName,
							contentType:
								asset.contentType ||
								distributionList.posterImageAsset.contentType ||
								"application/octet-stream",
						});
					}
				}

				if (item.includePermitForm && item.city.permitFormAsset) {
					const asset = await getCachedAsset(item.city.permitFormAsset);
					if (asset) {
						attachments.push({
							filename: item.city.permitFormAsset.fileName,
							contentType:
								asset.contentType ||
								item.city.permitFormAsset.contentType ||
								"application/pdf",
							content: asset.buffer,
						});
						attachmentMeta.push({
							filename: item.city.permitFormAsset.fileName,
							contentType:
								asset.contentType ||
								item.city.permitFormAsset.contentType ||
								"application/pdf",
						});
					}
				}

				const response = await sendRawEmail({
					from: process.env.SES_FROM_ADDRESS || "",
					to: recipient,
					subject,
					text: textBody,
					html: htmlBody,
					attachments,
				});
				
				// ----------------------------------------------------
				// NEUER, SPEZIFISCHER LOG IM TRY-BLOCK (FÜR ERFOLG)
				// ----------------------------------------------------
				console.log("SENDING TO RECIPENT:", recipient, " | AWS RESPONSE:", response); 

				const messageId = response.MessageId;

				await prisma.$transaction([
					prisma.permitEmail.create({
						data: {
							distributionListItemId: item.id,
							direction: EmailDirection.outbound,
							status: EmailStatus.sent,
							subject,
							bodyText: textBody,
							bodyHtml: htmlBody,
							attachments: attachmentMeta,
							messageId,
							sentAt,
						},
					}),
					prisma.distributionListItem.update({
						where: { id: item.id },
						data: {
							permitStatus: PermitStatus.sent,
							sentAt,
						},
					}),
				]);

				sendResults.push({
					itemId: item.id,
					cityName: item.city.name,
					email: recipient,
					status: "sent",
					messageId,
				});
			} catch (error: any) {
				// ----------------------------------------------------
				// NEUER, SPEZIFISCHER LOG IM CATCH-BLOCK (FÜR FEHLER)
				// ----------------------------------------------------
				console.error("CRITICAL SEND ERROR TO:", recipient, " | DETAILS:", error);
				
				const errorMessage = error?.message || "Unbekannter Fehler beim Versand";

				await prisma.permitEmail.create({
					data: {
						distributionListItemId: item.id,
						direction: EmailDirection.outbound,
						status: EmailStatus.failed,
						subject,
						bodyText: textBody,
						bodyHtml: htmlBody,
						attachments: attachmentMeta,
						sentAt,
						messageId: error?.$metadata?.requestId,
					},
				});

				sendResults.push({
					itemId: item.id,
					cityName: item.city.name,
					email: recipient,
					status: "failed",
					error: errorMessage,
				});
			}
		}

		return NextResponse.json({
			sentAt,
			count: sendResults.length,
			results: sendResults,
		});
	} catch (error) {
		console.error("Fehler beim Senden der Anträge:", error);
		return NextResponse.json(
			{ error: "Fehler beim Senden der Anträge" },
			{ status: 500 }
		);
	}
}