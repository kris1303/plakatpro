import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadToS3 } from "@/lib/storage";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = {
  "poster-images": 6 * 1024 * 1024, // 6 MB
  "permit-forms": 8 * 1024 * 1024, // 8 MB
} as const;

type UploadCategory = keyof typeof MAX_SIZE_BYTES;

function isUploadCategory(value: string): value is UploadCategory {
  return Object.prototype.hasOwnProperty.call(MAX_SIZE_BYTES, value);
}

function slugifyFileName(fileName: string) {
  const normalized = fileName.normalize("NFKD");
  const parts = normalized.split(".");
  const extension = parts.length > 1 ? `.${parts.pop()!.toLowerCase()}` : "";
  const base = parts
    .join(".")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "file"}${extension}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const categoryRaw = (formData.get("category") as string | null) ?? "poster-images";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Es wurde keine Datei übergeben." },
        { status: 400 }
      );
    }

    if (!isUploadCategory(categoryRaw)) {
      return NextResponse.json(
        { error: "Ungültige Kategorie. Erlaubt sind poster-images oder permit-forms." },
        { status: 400 }
      );
    }

    const category = categoryRaw;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const size = buffer.byteLength;
    const contentType = file.type || "application/octet-stream";

    const maxSize = MAX_SIZE_BYTES[category];
    if (size > maxSize) {
      return NextResponse.json(
        {
          error: `Datei ist zu groß. Maximal ${Math.round(maxSize / (1024 * 1024))} MB erlaubt.`,
        },
        { status: 400 }
      );
    }

    if (category === "poster-images" && !contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Posterbilder müssen ein Bildformat (image/*) sein." },
        { status: 400 }
      );
    }

    if (category === "permit-forms" && contentType !== "application/pdf") {
      return NextResponse.json(
        { error: "Kommunale Formulare müssen als PDF hochgeladen werden." },
        { status: 400 }
      );
    }

    const safeFileName = slugifyFileName(file.name);
    const key = `${category}/${new Date().toISOString().split("T")[0]}-${crypto
      .randomUUID()
      .slice(0, 12)}-${safeFileName}`;

    await uploadToS3({
      key,
      body: buffer,
      contentType,
    });

    const asset = await prisma.fileAsset.create({
      data: {
        key,
        fileName: file.name,
        contentType,
        size,
      },
    });

    return NextResponse.json(
      {
        id: asset.id,
        fileName: asset.fileName,
        contentType: asset.contentType,
        size: asset.size,
        key: asset.key,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload-Fehler:", error);
    return NextResponse.json(
      { error: "Datei konnte nicht hochgeladen werden." },
      { status: 500 }
    );
  }
}


