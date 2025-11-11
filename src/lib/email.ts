import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

export type EmailAttachment = {
  filename: string;
  contentType: string;
  content: Buffer | string;
};

export type RawEmailOptions = {
  from: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
};

let sesClient: SESv2Client | null = null;

function getSesClient() {
  if (sesClient) return sesClient;

  sesClient = new SESv2Client({
    region: process.env.AWS_REGION,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  return sesClient;
}

function ensureArray(value: string | string[]) {
  return Array.isArray(value) ? value : [value];
}

export function buildRawEmail({
  from,
  to,
  cc = [],
  bcc = [],
  subject,
  text,
  html,
  attachments = [],
}: RawEmailOptions) {
  const mixedBoundary = `Mixed_${Date.now()}`;
  const alternativeBoundary = `Alt_${Date.now()}`;
  const toList = ensureArray(to).join(", ");
  const ccList = cc.length ? `\nCc: ${cc.join(", ")}` : "";
  const bccList = bcc.length ? `\nBcc: ${bcc.join(", ")}` : "";

  const header = [
    `From: ${from}`,
    `To: ${toList}`,
    ccList.trim() ? ccList.trimStart() : "",
    bccList.trim() ? bccList.trimStart() : "",
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary=\"${mixedBoundary}\"`,
  ]
    .filter(Boolean)
    .join("\n");

  const alternativePart = [
    `--${mixedBoundary}`,
    `Content-Type: multipart/alternative; boundary=\"${alternativeBoundary}\"`,
    "",
    `--${alternativeBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${alternativeBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
    "",
    `--${alternativeBoundary}--`,
  ].join("\n");

  const attachmentParts = attachments
    .map((attachment) => {
      const buffer =
        typeof attachment.content === "string"
          ? Buffer.from(attachment.content)
          : attachment.content;
      const base64 = buffer.toString("base64");
      const base64Chunks =
        base64.match(/.{1,76}/g)?.join("\n") ?? base64;

      return [
        `--${mixedBoundary}`,
        `Content-Type: ${attachment.contentType}; name=\"${attachment.filename}\"`,
        `Content-Disposition: attachment; filename=\"${attachment.filename}\"`,
        "Content-Transfer-Encoding: base64",
        "",
        base64Chunks,
        "",
      ].join("\n");
    })
    .join("\n");

  const closingBoundary = `--${mixedBoundary}--`;

  return [header, "", alternativePart, attachmentParts, closingBoundary, ""].join("\n");
}

export async function sendRawEmail(options: RawEmailOptions) {
  const fromAddress = options.from || process.env.SES_FROM_ADDRESS;
  if (!fromAddress) {
    throw new Error("SES_FROM_ADDRESS ist nicht konfiguriert");
  }

  const rawMessage = buildRawEmail({ ...options, from: fromAddress });
  const client = getSesClient();

  const command = new SendEmailCommand({
    FromEmailAddress: fromAddress,
    Destination: {
      ToAddresses: ensureArray(options.to),
      CcAddresses: options.cc,
      BccAddresses: options.bcc,
    },
    Content: {
      Raw: {
        Data: Buffer.from(rawMessage, "utf-8"),
      },
    },
    ConfigurationSetName: process.env.SES_CONFIG_SET || undefined,
  });

  return client.send(command);
}

