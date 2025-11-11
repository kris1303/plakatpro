import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "node:stream";

type UploadParams = {
  key: string;
  body: Buffer;
  contentType: string;
};

type DownloadResult = {
  buffer: Buffer;
  contentType: string;
};

let s3Client: S3Client | null = null;

function requireBucket(): string {
  const bucket = process.env.PERMIT_ATTACHMENT_BUCKET;
  if (!bucket) {
    throw new Error(
      "PERMIT_ATTACHMENT_BUCKET ist nicht gesetzt. Bitte .env konfigurieren."
    );
  }
  return bucket;
}

function getS3Client() {
  if (s3Client) {
    return s3Client;
  }

  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("AWS_REGION ist nicht gesetzt. Bitte .env konfigurieren.");
  }

  s3Client = new S3Client({
    region,
    credentials:
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
  });

  return s3Client;
}

async function streamToBuffer(stream: Readable | Blob | undefined): Promise<Buffer> {
  if (!stream) {
    return Buffer.alloc(0);
  }

  if (stream instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }

  if ("arrayBuffer" in stream) {
    const arrayBuffer = await stream.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  throw new Error("Unsupported stream type received from S3");
}

export async function uploadToS3({ key, body, contentType }: UploadParams) {
  const bucket = requireBucket();
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function downloadFromS3(key: string): Promise<DownloadResult | null> {
  const bucket = requireBucket();
  const client = getS3Client();

  try {
    const { Body, ContentType } = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const buffer = await streamToBuffer(Body as Readable | undefined);
    return {
      buffer,
      contentType: ContentType || "application/octet-stream",
    };
  } catch (error) {
    if ((error as any)?.$metadata?.httpStatusCode === 404) {
      console.warn(`S3 Asset nicht gefunden: ${key}`);
      return null;
    }

    console.error("Fehler beim Download von S3:", error);
    throw error;
  }
}

export async function deleteFromS3(key: string) {
  const bucket = requireBucket();
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function objectExistsOnS3(key: string): Promise<boolean> {
  const bucket = requireBucket();
  const client = getS3Client();

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if ((error as any)?.$metadata?.httpStatusCode === 404) {
      return false;
    }

    console.error("Fehler bei HeadObject für S3:", error);
    throw error;
  }
}

