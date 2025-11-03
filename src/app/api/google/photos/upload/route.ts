import { NextRequest, NextResponse } from "next/server";
import { uploadPhotoToGooglePhotos } from "@/lib/photos";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const albumId = formData.get("albumId") as string;
    const campaignId = formData.get("campaignId") as string;
    const accessToken = formData.get("accessToken") as string;
    const planItemId = formData.get("planItemId") as string | null;

    if (!file || !albumId || !campaignId || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Datei zu Buffer konvertieren
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Zu Google Photos hochladen
    const mediaItemId = await uploadPhotoToGooglePhotos(
      buffer,
      file.name,
      albumId,
      accessToken
    );

    // In Datenbank speichern
    const photo = await prisma.photo.create({
      data: {
        campaignId,
        googleMediaItemId: mediaItemId,
        takenAt: new Date(),
      },
    });

    // Optional: Placement erstellen/aktualisieren
    if (planItemId) {
      await prisma.placement.create({
        data: {
          planItemId,
          photoId: photo.id,
          status: "hung",
          takenAt: new Date(),
        },
      });

      // Remaining Qty aktualisieren
      const planItem = await prisma.planItem.findUnique({
        where: { id: planItemId },
      });

      if (planItem && planItem.remainingQty > 0) {
        await prisma.planItem.update({
          where: { id: planItemId },
          data: {
            remainingQty: planItem.remainingQty - 1,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      photoId: photo.id,
      mediaItemId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

