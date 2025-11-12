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
		): Promise<{ buffer: Buffer; contentType: string } | null> => {
			if (!asset) return null;
			if (assetCache.has(asset.id)) {
				return assetCache.get(asset.id)!;
			}
			const downloaded = await downloadFromS3(asset.key);
			if (!downloaded) {
				console.warn(`S3 Asset konnte nicht geladen werden: ${asset.key}`);
				return null;
			}
			assetCache.set(asset.id, downloaded);
			return downloaded;
		};

		const formatDate = (value: string | Date | null | undefined) => {
			if (!value) return "";
			return new Date(value).toLocaleDateString("de-DE");
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

			const formattedStart = formatDate(distributionList.startDate);
			const formattedEnd = formatDate(distributionList.endDate);
			const formattedEventDate = formatDate(distributionList.eventDate);
			const distanceInfo = item.distanceKm
				? `${item.distanceKm.toFixed(1)} km`
				: null;

			const subject = `Plakatierungsantrag – Veranstaltung „${distributionList.eventName}“ vom ${formattedStart} bis ${formattedEnd}`;

			const attachmentMeta: { filename: string; contentType: string }[] = [];
			const attachments: Parameters<typeof sendRawEmail>[0]["attachments"] = [];
			let textBody = "";
			let htmlBody = "";

			try {
				const shouldAttachPosterImage =
					(item.includePosterImage ||
						item.city.requiresPosterImage) &&
					!!distributionList.posterImageAsset;

				if (shouldAttachPosterImage) {
					const asset = await getCachedAsset(distributionList.posterImageAsset);
					if (asset) {
						attachments.push({
							filename: distributionList.posterImageAsset?.fileName ?? "poster.jpg",
							contentType:
								asset.contentType ||
								distributionList.posterImageAsset?.contentType ||
								"application/octet-stream",
							content: asset.buffer,
						});
						attachmentMeta.push({
							filename: distributionList.posterImageAsset?.fileName ?? "poster.jpg",
							contentType:
								asset.contentType ||
								distributionList.posterImageAsset?.contentType ||
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

				const attachmentsList = attachmentMeta
					.map((file) => `- ${file.filename}`)
					.join("\n");
				const htmlAttachmentsList = attachmentMeta
					.map((file) => `<li>${file.filename}</li>`)
					.join("");

				textBody = `Sehr geehrte Damen und Herren der ${item.city.name},

wir beantragen hiermit eine Genehmigung zur Plakatierung für die Veranstaltung „${distributionList.eventName}“ im Zeitraum vom ${formattedStart} bis ${formattedEnd}.

Veranstaltungsdaten:
${formattedEventDate ? `- Veranstaltungstag: ${formattedEventDate}\n` : ""}${
					distributionList.eventAddress
						? `- Veranstaltungsort: ${distributionList.eventAddress}\n`
						: ""
				}Geplante Plakatierung in Ihrem Zuständigkeitsbereich:
- Anzahl Plakate: ${item.quantity}
- Format: ${item.posterSize}

${attachmentMeta.length ? `Beigefügte Unterlagen:\n${attachmentsList}\n` : ""}Für Rückfragen stehen wir jederzeit zur Verfügung und freuen uns über eine kurze Rückmeldung zu Ihrem Entscheid.

Vielen Dank und freundliche Grüße
Kristijan Cajic
Werbeinsel`;

				htmlBody = `
				<p>Sehr geehrte Damen und Herren der ${item.city.name},</p>
				<p>wir beantragen hiermit eine Genehmigung zur Plakatierung für die Veranstaltung „<strong>${distributionList.eventName}</strong>“ im Zeitraum vom <strong>${formattedStart}</strong> bis <strong>${formattedEnd}</strong>.</p>
				<p><strong>Veranstaltungsdaten:</strong></p>
				<ul>
					${
						formattedEventDate
							? `<li>Veranstaltungstag: <strong>${formattedEventDate}</strong></li>`
							: ""
					}
					${
						distributionList.eventAddress
							? `<li>Veranstaltungsort: <strong>${distributionList.eventAddress}</strong></li>`
							: ""
					}
				</ul>
				<p><strong>Geplante Plakatierung in Ihrem Zuständigkeitsbereich:</strong></p>
				<ul>
					<li>Anzahl Plakate: <strong>${item.quantity}</strong></li>
					<li>Format: <strong>${item.posterSize}</strong></li>
				</ul>
				${
					attachmentMeta.length
						? `<p><strong>Beigefügte Unterlagen:</strong></p><ul>${htmlAttachmentsList}</ul>`
						: ""
				}
				<p>Für Rückfragen stehen wir jederzeit zur Verfügung und freuen uns über eine kurze Rückmeldung zu Ihrem Entscheid.</p>
				<p>Vielen Dank und freundliche Grüße<br/>Kristijan Cajic<br/>Werbeinsel</p>
			`;

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